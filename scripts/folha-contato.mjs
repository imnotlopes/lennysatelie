/**
 * Monta uma folha de contato numerada das fotos de uma pasta.
 *
 * Uso:
 *   node scripts/folha-contato.mjs imagens-atelie/casamento-civil
 *
 * Serve para olhar dezenas de arquivos de uma vez e cruzar com o catálogo,
 * em vez de abrir um por um. O número impresso em cada quadro é o índice na
 * listagem em ordem alfabética — é por ele que a gente se refere a cada foto.
 */

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const pasta = process.argv[2];
if (!pasta) {
  console.error("Informe a pasta.");
  process.exit(1);
}

const CELULA_L = 200;
const CELULA_A = 300;
const COLUNAS = 6;

const arquivos = (await readdir(pasta))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

console.log(`${arquivos.length} imagens em ${pasta}`);

const linhas = Math.ceil(arquivos.length / COLUNAS);
const largura = COLUNAS * CELULA_L;
const altura = linhas * CELULA_A;

const camadas = [];

for (const [i, nome] of arquivos.entries()) {
  const buffer = await sharp(path.join(pasta, nome))
    .resize(CELULA_L, CELULA_A, { fit: "cover" })
    .toBuffer();

  const col = i % COLUNAS;
  const lin = Math.floor(i / COLUNAS);

  camadas.push({
    input: buffer,
    left: col * CELULA_L,
    top: lin * CELULA_A,
  });

  // Numero em cima, com tarja para ler sobre qualquer foto.
  const etiqueta = Buffer.from(
    `<svg width="${CELULA_L}" height="34">
       <rect x="0" y="0" width="44" height="26" fill="#312929"/>
       <text x="8" y="19" font-family="monospace" font-size="16" fill="#ffffff">${i + 1}</text>
     </svg>`,
  );
  camadas.push({
    input: etiqueta,
    left: col * CELULA_L,
    top: lin * CELULA_A,
  });
}

const destino = path.join(process.argv[3] ?? ".", "folha-contato.jpg");

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

console.log(`folha: ${destino} (${largura}x${altura})`);

// Indice para cruzar numero com arquivo.
await writeFile(
  path.join(process.argv[3] ?? ".", "folha-contato-indice.txt"),
  arquivos.map((n, i) => `${i + 1}\t${n}`).join("\n"),
  "utf-8",
);
console.log("indice: folha-contato-indice.txt");
