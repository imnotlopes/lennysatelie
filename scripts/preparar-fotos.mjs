/**
 * Prepara as fotos do ateliê para o Storage.
 *
 * Uso:
 *   node scripts/preparar-fotos.mjs imagens-atelie/casamento-civil imagens-atelie/mapa-casamento-civil.txt
 *
 * Lê um mapa "numero = Nome do Vestido", comprime cada foto para webp 1600px
 * qualidade 82 (a mesma receita do uploader do painel) e grava em
 * `imagens-atelie/_prontas/` com o nome final que o arquivo vai ter no bucket:
 * `<slug>-1.webp`, `<slug>-2.webp`.
 *
 * Fazer o nome ser determinístico é o que permite gravar o caminho no banco
 * antes de os arquivos existirem no bucket — a ligação e o envio deixam de
 * depender um do outro.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const LARGURA_MAXIMA = 1600;
const QUALIDADE = 82;

const pastaFotos = process.argv[2];
const arquivoMapa = process.argv[3];

if (!pastaFotos || !arquivoMapa) {
  console.error("Uso: node scripts/preparar-fotos.mjs <pasta> <mapa>");
  process.exit(1);
}

function slugificar(nome) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---- Le o mapa -------------------------------------------------------------

const linhas = (await readFile(arquivoMapa, "utf-8"))
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const mapa = new Map(); // numero -> nome
for (const linha of linhas) {
  // Linha de comentario ou recado no mapa.
  if (linha.startsWith("#")) continue;

  const m = linha.match(/^(\d+)\s*=\s*(.*)$/);
  if (!m) continue;

  // Numero sem nome preenchido. Acontece o tempo todo: a dona nao reconhece
  // uma foto e pula a linha. Antes isso virava uma peca chamada "=", porque o
  // regex antigo aceitava qualquer sobra — inclusive o proprio sinal de igual.
  const nome = m[2].trim();
  if (!nome || !/[a-zA-ZÀ-ÿ]/.test(nome)) continue;

  mapa.set(Number.parseInt(m[1], 10), nome);
}

// ---- Agrupa por peca, preservando a ordem dos numeros ----------------------

const porSlug = new Map(); // slug -> [numero, ...]
const semProduto = [];

for (const [numero, nome] of [...mapa.entries()].sort((a, b) => a[0] - b[0])) {
  // "Opção sob medidas" nao e peca de locacao: ficou fora do acervo.
  if (/sob\s*medida/i.test(nome)) {
    semProduto.push({ numero, nome });
    continue;
  }
  const slug = slugificar(nome);
  if (!porSlug.has(slug)) porSlug.set(slug, []);
  porSlug.get(slug).push(numero);
}

// ---- Comprime ---------------------------------------------------------------

const saida = path.join("imagens-atelie", "_prontas");
await mkdir(saida, { recursive: true });

const arquivos = await readdir(pastaFotos);
const porNumero = new Map();
for (const f of arquivos) {
  const m = f.match(/^(\d+)\.(webp|jpe?g|png)$/i);
  if (m) porNumero.set(Number.parseInt(m[1], 10), f);
}

const registro = [];
let totalOriginal = 0;
let totalFinal = 0;

for (const [slug, numeros] of porSlug) {
  for (const [indice, numero] of numeros.entries()) {
    const origem = porNumero.get(numero);
    if (!origem) {
      console.warn(`  aviso: nao achei arquivo para o numero ${numero}`);
      continue;
    }

    const nomeFinal = `${slug}-${indice + 1}.webp`;
    const caminhoOrigem = path.join(pastaFotos, origem);

    const entrada = sharp(caminhoOrigem);
    const meta = await entrada.metadata();
    const escala = Math.min(1, LARGURA_MAXIMA / meta.width);

    const info = await entrada
      .resize({ width: Math.round(meta.width * escala) })
      .webp({ quality: QUALIDADE })
      .toFile(path.join(saida, nomeFinal));

    const bytesOrigem = (await sharp(caminhoOrigem).metadata()).size ?? 0;
    totalOriginal += bytesOrigem;
    totalFinal += info.size;

    registro.push({
      numero,
      slug,
      posicao: indice + 1,
      arquivo: nomeFinal,
      caminhoBucket: `produtos/${nomeFinal}`,
      dimensoes: `${info.width}x${info.height}`,
      bytes: info.size,
    });
  }
}

// ---- Relatorio --------------------------------------------------------------

console.log(`\n${porSlug.size} pecas, ${registro.length} fotos preparadas em ${saida}`);
if (totalOriginal) {
  const mb = (v) => (v / 1024 / 1024).toFixed(1).replace(".", ",");
  console.log(`tamanho: ${mb(totalOriginal)} MB -> ${mb(totalFinal)} MB`);
}

const comVarias = [...porSlug.entries()].filter(([, n]) => n.length > 1);
if (comVarias.length) {
  console.log("\npecas com mais de uma foto:");
  for (const [slug, numeros] of comVarias) {
    console.log(`  ${slug}: fotos ${numeros.join(", ")}`);
  }
}

if (semProduto.length) {
  console.log("\nfotos sem peca correspondente no acervo:");
  for (const { numero, nome } of semProduto) {
    console.log(`  ${numero} — ${nome}`);
  }
}

await writeFile(
  path.join("imagens-atelie", "_prontas", "registro.json"),
  JSON.stringify(registro, null, 2),
  "utf-8",
);
console.log("\nregistro: imagens-atelie/_prontas/registro.json");
