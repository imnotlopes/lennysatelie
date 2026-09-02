/**
 * Prepara as três coleções novas: comprime, batiza e gera o SQL.
 *
 * Uso:
 *   node scripts/preparar-colecoes.mjs
 *
 * Uma foto vira uma peça, como o Edson pediu. Os nomes são PROVISÓRIOS: ele
 * disse para inventar por enquanto. A folha de conferência gerada no fim mostra
 * cada foto com o nome que recebeu, para a Lennys renomear pelo painel sem ter
 * que adivinhar qual é qual.
 *
 * Preço fica nulo de propósito. Nome errado se corrige sem consequência; preço
 * errado num site de aluguel faz a cliente chegar esperando um valor que não
 * existe. Sem preço, a peça aparece como "sob consulta", que é a verdade.
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const LARGURA_MAXIMA = 1600;
const QUALIDADE = 82;

/**
 * Nomes femininos para batizar as peças, no mesmo estilo do acervo que já
 * existe. Nenhum repete os cinquenta já cadastrados.
 */
const NOMES = `Adriene Alexia Amabile Anelise Antonella Ariela Belinda Bruna
Camélia Carolita Cassiane Catarina Celeste Ciara Clarice Danubia Dayanne
Delfina Denise Eduarda Elaine Eloá Emanuele Esmeralda Estela Fabiola Fernanda
Flavia Franciele Gabriela Genoveva Giovana Gislaine Graziela Helena Heloisa
Iara Ingrid Iolanda Isadora Ivana Jacinta Janaina Jandira Jeniffer Josiane
Jussara Karina Katiuscia Laisa Lariane Leticia Liandra Lorena Luana Lucimara
Ludmila Luiza Madalena Maiara Malu Manuela Marcela Mariel Marilia Marlene
Melissa Mirela Morgana Nadine Natalia Neide Nicole Noemia Olivia Otilia
Pamela Patricia Penelope Perola Pietra Priscila Rafaela Regiane Renata Rosalia
Rosangela Rubia Sabrina Samara Sandra Selena Sheila Silvana Simone Solange
Soraia Suelen Tamires Tatiana Thainara Valentina Valeria Vanessa Veridiana
Violeta Vitoria Viviane Wanessa Yasmin Zilda Amanda Bianca Camila Carla
Cristina Daniela Elisa Erica Evelyn Fatima Gisele Iasmin Ivone Joana Julia
Karen Larissa Lidia Livia Marina Michele Milena Mirna Monica Nayara Olga
Paloma Poliana Rita Rosa Sabrine Sarah Silvia Sofia Tania Telma Teresa
Thais Ursula Vera Vilma Yara Zenaide Alba Beatriz Cecilia Denia Edna Elza
Flora Gilda Hilda Ines Irene Jade Kelly Leila Lina Magda Nara Neusa Norma2
Odete Rute Sandy Tuane Ulisa Vania Wilma Ximena Zuleica`
  .split(/\s+/)
  .filter(Boolean);

const COLECOES = [
  { pasta: "Debutante-Damas", slug: "debutantes-damas", prefixo: "deb" },
  { pasta: "Nova Cerimônia Bordado", slug: "cerimonia-bordado", prefixo: "bor" },
  { pasta: "Vestidos lisos", slug: "vestidos-lisos", prefixo: "lis" },
];

function slugificar(nome) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const saida = path.join("imagens-atelie", "_prontas-colecoes");
await mkdir(saida, { recursive: true });

const registro = [];
let indiceNome = 0;
let bytesOrigem = 0;
let bytesFinal = 0;

for (const colecao of COLECOES) {
  const dir = path.join("imagens-atelie", colecao.pasta);
  const arquivos = (await readdir(dir))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  for (const [i, arquivo] of arquivos.entries()) {
    const nome = `Vestido ${NOMES[indiceNome++]}`;
    const slug = slugificar(nome);
    const destino = `${slug}-1.webp`;

    const origem = path.join(dir, arquivo);
    const meta = await sharp(origem).metadata();
    const escala = Math.min(1, LARGURA_MAXIMA / meta.width);

    const info = await sharp(origem)
      .rotate()
      .resize({ width: Math.round(meta.width * escala) })
      .webp({ quality: QUALIDADE })
      .toFile(path.join(saida, destino));

    bytesOrigem += (await readFile(origem)).length;
    bytesFinal += info.size;

    registro.push({
      colecao: colecao.slug,
      numeroNaFolha: i + 1,
      origem: arquivo,
      nome,
      slug,
      arquivo: destino,
      caminhoBucket: `produtos/${destino}`,
      dimensoes: `${info.width}x${info.height}`,
    });
  }
}

await writeFile(
  path.join(saida, "registro.json"),
  JSON.stringify(registro, null, 2),
  "utf-8",
);

// ---- SQL de carga -----------------------------------------------------------
const aspas = (t) => `'${String(t).replaceAll("'", "''")}'`;
const linhas = registro.map(
  (r) =>
    `  (${aspas(r.nome)}, ${aspas(r.slug)}, (select id from categorias where slug = ${aspas(r.colecao)}), array[${aspas(r.caminhoBucket)}], true)`,
);

await writeFile(
  path.join("imagens-atelie", "semear-colecoes.sql"),
  `insert into produtos (nome, slug, categoria_id, imagens, ativo) values\n${linhas.join(",\n")};\n`,
  "utf-8",
);

const porColecao = {};
for (const r of registro) porColecao[r.colecao] = (porColecao[r.colecao] ?? 0) + 1;

console.log(`${registro.length} peças preparadas`);
for (const [c, n] of Object.entries(porColecao)) console.log(`  ${c}: ${n}`);
console.log(
  `peso: ${Math.round(bytesOrigem / 1024 / 1024)}MB viraram ${Math.round(bytesFinal / 1024 / 1024)}MB`,
);
console.log(`nomes distintos: ${new Set(registro.map((r) => r.slug)).size}`);
if (!existsSync(path.join(saida, "registro.json"))) {
  throw new Error("registro nao foi gravado");
}
