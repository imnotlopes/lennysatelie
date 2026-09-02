/**
 * Gera o SQL que semeia a tabela `midias` com o que hoje está no código.
 *
 * Existe para a troca de fonte não apagar nada da home: as imagens que já
 * estão no ar viram linhas da tabela, e a partir daí a dona edita pelo painel.
 *
 * Uso:
 *   node scripts/semear-midias.mjs > imagens-atelie/semear-midias.sql
 */

import { readFile, writeFile } from "node:fs/promises";

const modulo = await readFile("lib/feedbacks.ts", "utf-8");

/** Pega o corpo de uma constante exportada, até o `];` que a fecha. */
function corpo(nome) {
  const inicio = modulo.indexOf(`export const ${nome}`);
  if (inicio === -1) throw new Error(`nao achei ${nome}`);
  const fim = modulo.indexOf("];", inicio);
  return modulo.slice(inicio, fim);
}

/** Extrai os pares campo/valor de cada item do bloco. */
function itens(bloco, campos) {
  const partes = bloco.split("{").slice(1);
  const saida = [];
  for (const parte of partes) {
    const item = {};
    for (const campo of campos) {
      const marca = `${campo}:`;
      const i = parte.indexOf(marca);
      if (i === -1) continue;
      const aspas = parte.indexOf('"', i);
      if (aspas === -1) continue;
      let valor = "";
      for (let j = aspas + 1; j < parte.length; j++) {
        if (parte[j] === '"' && parte[j - 1] !== "\\") break;
        valor += parte[j];
      }
      item[campo] = valor;
    }
    if (Object.keys(item).length) saida.push(item);
  }
  return saida;
}

const comImagem = itens(corpo("FEEDBACKS_COM_IMAGEM"), ["imagem", "transcricao"]);
const porMensagem = itens(corpo("FEEDBACKS_POR_MENSAGEM"), ["imagem", "transcricao"]);
const reels = itens(corpo("REELS"), ["capa", "url"]);

const aspas = (t) => (t == null ? "NULL" : `'${String(t).replaceAll("'", "''")}'`);
const linhas = [];

for (let i = 1; i <= 3; i++) {
  // O hero é decorativo: o texto do título já diz o que a foto ilustra, e
  // repetir isso no alt só faz o leitor de tela falar duas vezes.
  linhas.push(`('hero', '/fotos/hero-${i}.webp', NULL, NULL, ${i}, true)`);
}
comImagem.forEach((it, i) =>
  linhas.push(
    `('feedback_imagem', ${aspas(it.imagem)}, ${aspas(it.transcricao)}, NULL, ${i + 1}, true)`,
  ),
);
porMensagem.forEach((it, i) =>
  linhas.push(
    `('feedback_mensagem', ${aspas(it.imagem)}, ${aspas(it.transcricao)}, NULL, ${i + 1}, true)`,
  ),
);
reels.forEach((it, i) =>
  linhas.push(`('reel', ${aspas(it.capa)}, NULL, ${aspas(it.url)}, ${i + 1}, true)`),
);

const sql = `insert into midias (tipo, arquivo, texto_alt, url, ordem, ativo) values\n  ${linhas.join(",\n  ")};\n`;
await writeFile("imagens-atelie/semear-midias.sql", sql, "utf-8");

console.log(
  `hero 3 | com imagem ${comImagem.length} | mensagens ${porMensagem.length} | reels ${reels.length}`,
);
console.log(`total: ${linhas.length} linhas -> imagens-atelie/semear-midias.sql`);
