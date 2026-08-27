/**
 * Sobe as fotos preparadas para o Storage do Supabase.
 *
 * Uso:
 *   node --env-file=.env.local scripts/subir-fotos.mjs
 *
 * Lê `imagens-atelie/_prontas/` e envia cada arquivo para o bucket `produtos`
 * com exatamente o nome que já está gravado na coluna `imagens` do banco.
 *
 * Reenvia por cima (`upsert`) para poder rodar de novo depois de uma falha
 * parcial sem duplicar arquivo nem gerar órfão.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Preencha o .env.local antes.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pasta = path.join("imagens-atelie", "_prontas");
const arquivos = (await readdir(pasta)).filter((f) => f.endsWith(".webp")).sort();

console.log(`\nEnviando ${arquivos.length} fotos para o bucket "produtos"\n`);

let ok = 0;
const falhas = [];

for (const nome of arquivos) {
  const corpo = await readFile(path.join(pasta, nome));
  const destino = `produtos/${nome}`;

  const { error } = await supabase.storage
    .from("produtos")
    .upload(destino, corpo, { contentType: "image/webp", upsert: true });

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
