/**
 * Gera as imagens de placeholder da home em /public/placeholders.
 *
 * Uso:
 *   node scripts/gerar-placeholders.mjs
 *
 * São blocos em tons da paleta, nas proporções certas, só para o layout ter
 * o que renderizar enquanto o acervo real não sobe para o bucket. Quando as
 * fotos da Lennys existirem, este script e a pasta que ele gera podem sumir.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SAIDA = path.join(process.cwd(), "public", "placeholders");

// Tons do design system.
const CREME = "#faf2ed";
const CREME_ESCURO = "#ede6e0";
const PEDRA_CLARA = "#d6d0cb";
const PEDRA = "#998f8a";

/** SVG com gradiente diagonal e um véu suave, para não ficar chapado. */
function svg(largura, altura, de, para) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${de}"/>
          <stop offset="100%" stop-color="${para}"/>
        </linearGradient>
        <radialGradient id="v" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>
  `);
}

const IMAGENS = [
  // Hero: 16:9, tom mais fechado porque leva overlay escuro por cima.
  { nome: "hero.webp", w: 1920, h: 1080, de: PEDRA_CLARA, para: PEDRA },

  // Capas de categoria: 3:4.
  { nome: "categoria-bordados.webp", w: 900, h: 1200, de: CREME, para: PEDRA_CLARA },
  { nome: "categoria-lisos.webp", w: 900, h: 1200, de: CREME_ESCURO, para: PEDRA },
  { nome: "categoria-tule.webp", w: 900, h: 1200, de: CREME, para: CREME_ESCURO },

  // Produto: 2:3, a proporção do design system.
  { nome: "produto.webp", w: 800, h: 1200, de: CREME, para: CREME_ESCURO },

  // Depoimento: quadrada.
  { nome: "depoimento.webp", w: 240, h: 240, de: CREME_ESCURO, para: PEDRA_CLARA },
];

await mkdir(SAIDA, { recursive: true });

for (const img of IMAGENS) {
  const buffer = await sharp(svg(img.w, img.h, img.de, img.para))
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(path.join(SAIDA, img.nome), buffer);
  console.log(`  ${img.nome}  ${img.w}x${img.h}  ${(buffer.length / 1024).toFixed(1)} kB`);
}

// blurDataURL compartilhado para as imagens de src dinamico, onde o Next nao
// consegue gerar sozinho (isso so acontece com import estatico).
const blur = await sharp(svg(10, 15, CREME, CREME_ESCURO)).webp({ quality: 20 }).toBuffer();
console.log(`\nblurDataURL (${blur.length} bytes):`);
console.log(`data:image/webp;base64,${blur.toString("base64")}`);
