/**
 * Gera a imagem que aparece quando alguém compartilha o site.
 *
 * Uso:
 *   node scripts/gerar-og.mjs
 *
 * 1200x630 é o formato que WhatsApp, Instagram e Google leem. Importa mais
 * aqui do que na maioria dos sites: o ateliê fecha tudo no WhatsApp, então
 * esta imagem é o cartão que a Lennys manda para a cliente.
 *
 * A foto é a mesma do hero. O véu escurece só o suficiente para o nome passar
 * em contraste, sem apagar o vestido.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGEM = path.join("public", "fotos", "heros", "debutantes-damas.webp");
const DESTINO = path.join("app", "(site)", "opengraph-image.png");
const ALT = path.join("app", "(site)", "opengraph-image.alt.txt");

const L = 1200;
const A = 630;

const foto = await sharp(ORIGEM)
  .resize(L, A, { fit: "cover", position: "attention" })
  .toBuffer();

// Véu em gradiente, mais forte embaixo à esquerda, onde o texto fica.
const camada = Buffer.from(`
<svg width="${L}" height="${A}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veu" x1="0" y1="1" x2="0.7" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.78"/>
      <stop offset="55%" stop-color="#000" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.15"/>
    </linearGradient>
  </defs>
  <rect width="${L}" height="${A}" fill="url(#veu)"/>

  <text x="72" y="452" font-family="Georgia, 'Times New Roman', serif"
        font-size="76" fill="#ffffff">Lennys Ateliê</text>

  <rect x="72" y="486" width="86" height="2" fill="#eebab1"/>

  <text x="72" y="536" font-family="Helvetica, Arial, sans-serif"
        font-size="27" fill="#ffffff" opacity="0.9">
    Aluguel de vestidos de festa e noiva
  </text>
  <text x="72" y="574" font-family="Helvetica, Arial, sans-serif"
        font-size="23" fill="#ffffff" opacity="0.72" letter-spacing="2">
    JANDIRA, SÃO PAULO
  </text>
</svg>`);

const info = await sharp(foto)
  .composite([{ input: camada }])
  .png({ quality: 90 })
  .toFile(DESTINO);

await writeFile(
  ALT,
  "Debutante em vestido azul com bordado dourado. Lennys Ateliê, aluguel de vestidos de festa e noiva em Jandira, São Paulo.",
  "utf-8",
);

const bytes = (await readFile(DESTINO)).length;
console.log(
  `${DESTINO}: ${info.width}x${info.height}, ${Math.round(bytes / 1024)}KB`,
);
