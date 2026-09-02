/**
 * Folha de conferência das coleções novas: cada foto com o nome que recebeu.
 *
 * Uso:
 *   node scripts/folha-nomes.mjs
 *
 * Os nomes das três coleções novas foram inventados — o Edson pediu assim,
 * "pode inventar por enquanto". Esta folha existe para a Lennys trocar por
 * nomes de verdade sem ter que abrir peça por peça no painel: ela olha a
 * folha, vê a foto e o nome provisório embaixo, e corrige o que quiser.
 *
 * Uma folha por coleção, porque 170 quadros numa imagem só não se lê.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CELULA_L = 220;
const FOTO_A = 300;
const FAIXA_A = 30;
const CELULA_A = FOTO_A + FAIXA_A;
const COLUNAS = 6;

const base = path.join("imagens-atelie", "_prontas-colecoes");
const registro = JSON.parse(await readFile(path.join(base, "registro.json"), "utf-8"));
const saida = path.join("imagens-atelie", "folhas");
await mkdir(saida, { recursive: true });

const porColecao = new Map();
for (const r of registro) {
  if (!porColecao.has(r.colecao)) porColecao.set(r.colecao, []);
  porColecao.get(r.colecao).push(r);
}

const escapar = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

for (const [colecao, itens] of porColecao) {
  const linhas = Math.ceil(itens.length / COLUNAS);
  const largura = COLUNAS * CELULA_L;
  const altura = linhas * CELULA_A;
  const camadas = [];

  for (const [i, item] of itens.entries()) {
    const col = i % COLUNAS;
    const lin = Math.floor(i / COLUNAS);
    const left = col * CELULA_L;
    const top = lin * CELULA_A;

    camadas.push({
      input: await sharp(path.join(base, item.arquivo))
        .resize(CELULA_L, FOTO_A, { fit: "cover" })
        .toBuffer(),
      left,
      top,
    });

    // Nome numa faixa abaixo da foto, nunca por cima: sobre um vestido claro
    // texto branco some e texto escuro some sobre um vestido escuro.
    camadas.push({
      input: Buffer.from(
        `<svg width="${CELULA_L}" height="${FAIXA_A}">
           <rect width="${CELULA_L}" height="${FAIXA_A}" fill="#f1ebe4"/>
           <text x="8" y="20" font-family="sans-serif" font-size="14" fill="#312929">${escapar(item.nome)}</text>
         </svg>`,
      ),
      left,
      top: top + FOTO_A,
    });
  }

  const destino = path.join(saida, `${colecao}-nomes.jpg`);
  await sharp({
    create: {
      width: largura,
      height: altura,
      channels: 3,
      background: { r: 250, g: 248, b: 246 },
    },
  })
    .composite(camadas)
    .jpeg({ quality: 82 })
    .toFile(destino);

  await writeFile(
    path.join(saida, `${colecao}-nomes.txt`),
    itens
      .map((r) => `${String(r.numeroNaFolha).padStart(3, " ")}\t${r.nome}\t${r.origem}`)
      .join("\n"),
    "utf-8",
  );

  console.log(`${colecao}: ${itens.length} peças -> ${destino}`);
}
