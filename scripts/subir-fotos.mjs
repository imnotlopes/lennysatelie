/**
 * Sobe as fotos preparadas para o Storage do Supabase.
 *
 * Uso:
 *   node --env-file=.env.local scripts/subir-fotos.mjs [pasta] [--sobrescrever]
 *
 * Sem argumento usa `imagens-atelie/_prontas/`. Envia cada arquivo para o
 * bucket `produtos` com exatamente o nome que vai ficar gravado na coluna
 * `imagens` do banco.
 *
 * Por padrão NÃO sobrescreve. Se o arquivo já existir no bucket, o envio
 * daquele arquivo falha e aparece na lista do fim. Isso é de propósito: numa
 * carga de 170 fotos, um nome repetido com outra peça do acervo apagaria a
 * foto da peça antiga sem avisar ninguém. Já aconteceu aqui — duas peças
 * perderam a foto de capa desse jeito.
 *
 * Use `--sobrescrever` quando trocar por cima for o objetivo: restaurar um
 * arquivo, ou reenviar depois de uma falha parcial. Aí é uma decisão, não
 * um acidente.
 *
 * Escrever no bucket exige credencial com permissão. Em ordem de preferência:
 *
 *   1. SUPABASE_SERVICE_ROLE_KEY no .env.local — passa por cima do RLS, não
 *      mexe em política nenhuma. É o caminho limpo.
 *   2. A chave anônima, que só funciona enquanto existir uma política
 *      temporária de escrita. Nesse caso REVOGUE a política assim que o
 *      envio terminar: bucket aberto para escrita anônima é bucket que
 *      qualquer um enche de lixo.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const servico = process.env.SUPABASE_SERVICE_ROLE_KEY;
const key = servico || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Preencha o .env.local antes.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const argumentos = process.argv.slice(2);
const sobrescrever = argumentos.includes("--sobrescrever");
const pasta =
  argumentos.find((a) => !a.startsWith("--")) ||
  path.join("imagens-atelie", "_prontas");
const arquivos = (await readdir(pasta)).filter((f) => f.endsWith(".webp")).sort();

console.log(`\nEnviando ${arquivos.length} fotos de ${pasta} para o bucket "produtos"`);
console.log(servico ? "credencial: service role\n" : "credencial: anônima (precisa da política temporária)\n");

let ok = 0;
const falhas = [];

for (const nome of arquivos) {
  const corpo = await readFile(path.join(pasta, nome));
  const destino = `produtos/${nome}`;

  const { error } = await supabase.storage
    .from("produtos")
    .upload(destino, corpo, { contentType: "image/webp", upsert: sobrescrever });

  if (error) {
    falhas.push({ nome, erro: error.message });
    console.log(`  FALHA  ${nome} — ${error.message}`);
  } else {
    ok += 1;
    console.log(`  ok     ${destino}`);
  }
}

console.log(`\n${ok} enviadas, ${falhas.length} falharam.`);
process.exit(falhas.length ? 1 : 0);
