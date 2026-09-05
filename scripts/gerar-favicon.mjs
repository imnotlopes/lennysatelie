/**
 * Gera os ícones do site a partir do símbolo da marca.
 *
 * Uso:
 *   node scripts/gerar-favicon.mjs
 *
 * O site vinha com o favicon padrão do Next — o logo deles na aba do ateliê,
 * desde o primeiro commit.
 *
 * DUAS DECISÕES, AS DUAS MEDIDAS
 * ------------------------------
 * 1. Recorte. O símbolo é uma noiva de corpo inteiro com buquê, cheia de
 *    traço fino. Renderizado a 16px, que é o tamanho em que o favicon
 *    aparece na maior parte do tempo, a figura inteira vira um borrão sem
 *    forma. Só a cabeça e o busto continuam se lendo como uma noiva. Foi
 *    comparado lado a lado antes de escolher.
 *
 * 2. Fundo creme, não transparente. O desenho é preto. Sobre aba escura, um
 *    ícone transparente com traço preto simplesmente some. O creme é a cor
 *    do site e funciona nos dois temas.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIMBOLO = path.join("public", "marca", "simbolo.png");
const CREME = "#faf8f6";

/** Cabeça e busto: 102x88 dos 102x160 do original. */
const RECORTE = { left: 0, top: 0, width: 102, height: 88 };

/** O desenho não encosta na borda: ícone sem respiro parece apertado. */
const RESPIRO = 0.86;

async function quadrado(px) {
  const dentro = await sharp(SIMBOLO)
    .extract(RECORTE)
    .resize({
      width: Math.round(px * RESPIRO),
      height: Math.round(px * RESPIRO),
      fit: "inside",
    })
    .toBuffer();

  return sharp({
    create: { width: px, height: px, channels: 4, background: CREME },
  })
    .composite([{ input: dentro, gravity: "center" }])
    .png()
    .toBuffer();
}

/**
 * Monta um .ico com vários tamanhos dentro.
 *
 * O sharp não escreve .ico, e o formato é simples o bastante para montar na
 * mão: um cabeçalho, uma entrada de diretório por tamanho e os PNGs em
 * seguida. PNG dentro de .ico é lido por todo navegador em uso.
 *
 * O .ico continua existindo mesmo com `icon.png` ao lado porque muita
 * ferramenta e robô pede `/favicon.ico` direto, sem ler o HTML.
 */
function montarIco(imagens) {
  const CABECALHO = 6;
  const ENTRADA = 16;

  const diretorio = Buffer.alloc(CABECALHO + ENTRADA * imagens.length);
  diretorio.writeUInt16LE(0, 0); // reservado
  diretorio.writeUInt16LE(1, 2); // 1 = ícone
  diretorio.writeUInt16LE(imagens.length, 4);

  let deslocamento = diretorio.length;
  imagens.forEach(({ px, dados }, i) => {
    const p = CABECALHO + ENTRADA * i;
    diretorio.writeUInt8(px >= 256 ? 0 : px, p); // 0 significa 256
    diretorio.writeUInt8(px >= 256 ? 0 : px, p + 1);
    diretorio.writeUInt8(0, p + 2); // paleta: nenhuma
    diretorio.writeUInt8(0, p + 3); // reservado
    diretorio.writeUInt16LE(1, p + 4); // planos
    diretorio.writeUInt16LE(32, p + 6); // bits por pixel
    diretorio.writeUInt32LE(dados.length, p + 8);
    diretorio.writeUInt32LE(deslocamento, p + 12);
    deslocamento += dados.length;
  });

  return Buffer.concat([diretorio, ...imagens.map((i) => i.dados)]);
}

const tamanhosIco = [16, 32, 48];
const imagens = [];
for (const px of tamanhosIco) {
  imagens.push({ px, dados: await quadrado(px) });
}

await writeFile(path.join("app", "favicon.ico"), montarIco(imagens));

// `icon.png` grande: é dele que o navegador tira o ícone da aba em tela de
// alta densidade e o atalho na área de trabalho.
await writeFile(path.join("app", "icon.png"), await quadrado(512));

// O da Apple não pode ter transparência nem cantos próprios — o iOS arredonda
// sozinho. 180 é o tamanho que ele pede.
await writeFile(path.join("app", "apple-icon.png"), await quadrado(180));

console.log("app/favicon.ico    ", tamanhosIco.join(", ") + "px");
console.log("app/icon.png        512px");
console.log("app/apple-icon.png  180px");
