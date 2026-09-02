/**
 * Prepara as fotos de topo das coleções.
 *
 * Uso:
 *   node scripts/preparar-heros.mjs
 *
 * O Edson deixou uma foto de hero dentro da pasta de cada coleção nova. Este
 * script converte para webp e grava em `public/fotos/heros/`, que é de onde o
 * hero da home e as capas já são servidos hoje — não no bucket.
 *
 * Sem redimensionar: as originais já são menores que a tela em que vão
 * aparecer, e ampliar aqui só inventaria pixel e engordaria o arquivo.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const QUALIDADE = 84;

const HEROS = [
  {
    origem: "imagens-atelie/Debutante-Damas/Hero debutantes.jpeg",
    colecao: "debutantes-damas",
  },
  {
    origem: "imagens-atelie/Nova Cerimônia Bordado/hero nova cerimônia.jpeg",
    colecao: "cerimonia-bordado",
  },
  {
    origem: "imagens-atelie/Vestidos lisos/hero vestidos lisos.jpeg",
    colecao: "vestidos-lisos",
  },
];

const saida = path.join("public", "fotos", "heros");
await mkdir(saida, { recursive: true });

const feitos = [];

for (const hero of HEROS) {
  const destino = `${hero.colecao}.webp`;
  const info = await sharp(hero.origem)
    .rotate()
    .webp({ quality: QUALIDADE })
    .toFile(path.join(saida, destino));

  const antes = (await readFile(hero.origem)).length;

  feitos.push({
    colecao: hero.colecao,
    caminho: `/fotos/heros/${destino}`,
    dimensoes: `${info.width}x${info.height}`,
    kb: Math.round(info.size / 1024),
  });

  console.log(
    `${hero.colecao}: ${info.width}x${info.height}, ${Math.round(antes / 1024)}KB -> ${Math.round(info.size / 1024)}KB`,
  );
}

const aspas = (t) => `'${String(t).replaceAll("'", "''")}'`;
await writeFile(
  path.join("imagens-atelie", "heros-das-colecoes.sql"),
  feitos
    .map(
      (f) =>
        `update categorias set imagem_hero = ${aspas(f.caminho)} where slug = ${aspas(f.colecao)};`,
    )
    .join("\n") + "\n",
  "utf-8",
);

console.log(`\n${feitos.length} heros prontos em ${saida}`);
