/**
 * Gera o símbolo da marca em /public/marca a partir do arquivo de origem.
 *
 * Uso:
 *   node scripts/gerar-marca.mjs <caminho-do-png-de-origem>
 *
 * A Lennys ainda não tem logo desenhado. Este é um símbolo provisório: uma
 * ilustração de linha, fundo transparente, que acompanha o nome no cabeçalho.
 *
 * O arquivo é usado como MÁSCARA no CSS, não como imagem. Isso faz o símbolo
 * assumir a cor do texto do header — escuro quando o header está sólido,
 * claro quando está transparente sobre o hero. Se fosse `<img>`, o desenho
 * preto sumiria em cima da foto escura.
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const origem = process.argv[2];
if (!origem) {
  console.error("Informe o caminho do PNG de origem.");
  process.exit(1);
}

const SAIDA = path.join(process.cwd(), "public", "marca");
await mkdir(SAIDA, { recursive: true });

const meta = await sharp(origem).metadata();
console.log(`origem:  ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`);

// Apara o transparente em volta da figura, senão o símbolo fica pequeno
// dentro de uma caixa cheia de vazio.
const aparado = await sharp(origem).trim({ threshold: 1 }).toBuffer();
const metaAparado = await sharp(aparado).metadata();
console.log(`aparado: ${metaAparado.width}x${metaAparado.height}`);

// 160px de altura: 4x a altura de exibição (40px), com folga para telas densas.
const info = await sharp(aparado)
  .resize({
    height: 160,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png({ compressionLevel: 9 })
  .toFile(path.join(SAIDA, "simbolo.png"));

console.log(
  `gerado:  ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} kB`,
);
console.log(`proporcao (largura/altura): ${(info.width / info.height).toFixed(3)}`);
