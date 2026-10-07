/**
 * Converte para webp as fotos do site que ficaram em JPEG ou PNG.
 *
 * Uso:
 *   node --env-file=.env.local scripts/converter-para-webp.mjs                                     (só mostra)
 *   node --env-file=.env.local scripts/converter-para-webp.mjs --aplicar                           (converte)
 *   node --env-file=.env.local scripts/converter-para-webp.mjs --apagar-originais                  (só mostra)
 *   node --env-file=.env.local scripts/converter-para-webp.mjs --apagar-originais --aplicar        (apaga)
 *
 * POR QUE EXISTE
 * --------------
 * O Safari, no iPhone e no Mac, não gera webp. Até o painel ganhar a
 * conversão no servidor (`lib/admin/enviar-foto.ts`), toda foto enviada de lá
 * subia em JPEG. Medido em 07/10/2026: 41 fotos de vestido, 11 imagens de
 * coleção e 1 capa de vídeo.
 *
 * Em 17/09 já houve uma conversão: ela gravou o `.webp` ao lado de cada JPEG
 * e parou aí, sem trocar o banco. Esses webp seguem no bucket sem uso. Este
 * script os regrava a partir do JPEG, com a receita de hoje, e faz a parte
 * que faltou.
 *
 * O envio novo cai para JPEG se a conversão do servidor falhar, então este
 * script continua útil: rodar de novo encontra o que tiver sobrado.
 *
 * EM DOIS TEMPOS, DE PROPÓSITO
 * ----------------------------
 * 1. Converter: grava o `.webp` ao lado de cada JPEG e troca o caminho no
 *    banco. O JPEG FICA. As páginas do site guardam as consultas por até uma
 *    hora; se o JPEG sumisse agora, quem abrisse o site nessa hora veria a
 *    foto quebrada.
 *
 * 2. Apagar os originais: depois de uma hora, ou de um novo deploy, nenhuma
 *    página aponta mais para eles. Só sai o JPEG que (a) tem o `.webp` ao
 *    lado e (b) nenhuma linha do banco usa. JPEG órfão sem webp ao lado não é
 *    deste script, e fica onde está.
 *
 * Sem `--aplicar`, nada é gravado nem apagado: o script só lista o que faria.
 *
 * Precisa da SUPABASE_SERVICE_ROLE_KEY no .env.local: a chave anônima não
 * enxerga peças desligadas nem pode atualizar o banco.
 *
 * A receita da conversão é a mesma de `lib/admin/converter-webp.ts`. Se
 * mudar lá, mude aqui.
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const PIXELS_MAXIMOS = 1600 * 1600;
const QUALIDADE = 82;
const BUCKET = "produtos";
const PASTAS = ["produtos", "site"];
const NAO_WEBP = /\.(jpe?g|png)$/i;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const servico = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !servico) {
  console.error(
    "\nPreencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.\n",
  );
  process.exit(1);
}

const supabase = createClient(url, servico, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const argumentos = process.argv.slice(2);
const aplicar = argumentos.includes("--aplicar");
const apagarOriginais = argumentos.includes("--apagar-originais");

/** Caminho do bucket que ainda não é webp. `/fotos/...` e links ficam de fora. */
const precisaConverter = (caminho) =>
  typeof caminho === "string" &&
  !caminho.startsWith("/") &&
  !caminho.startsWith("http") &&
  NAO_WEBP.test(caminho);

const paraWebp = (caminho) => caminho.replace(/\.[^.]+$/, ".webp");

/* -------------------------------------------------------------------------- */
/* Quem usa cada foto                                                         */
/* -------------------------------------------------------------------------- */

async function lerReferencias() {
  const [produtos, categorias, midias] = await Promise.all([
    supabase.from("produtos").select("id, nome, imagens"),
    supabase.from("categorias").select("id, nome, imagem_capa, imagem_hero"),
    supabase.from("midias").select("id, tipo, arquivo"),
  ]);

  for (const r of [produtos, categorias, midias]) {
    if (r.error) {
      console.error("Falha ao ler o banco:", r.error.message);
      process.exit(1);
    }
  }

  return {
    produtos: produtos.data,
    categorias: categorias.data,
    midias: midias.data,
  };
}

function todosOsCaminhos({ produtos, categorias, midias }) {
  return new Set([
    ...produtos.flatMap((p) => p.imagens ?? []),
    ...categorias.flatMap((c) => [c.imagem_capa, c.imagem_hero]),
    ...midias.map((m) => m.arquivo),
  ].filter(Boolean));
}

/* -------------------------------------------------------------------------- */
/* Tempo 1: converter                                                         */
/* -------------------------------------------------------------------------- */

async function converter(entrada) {
  const imagem = sharp(entrada).rotate();
  const { width = 0, height = 0 } = await imagem.metadata();
  if (!width || !height) throw new Error("arquivo sem dimensoes");

  const escala = Math.min(1, Math.sqrt(PIXELS_MAXIMOS / (width * height)));
  if (escala < 1) {
    const lado = Math.round(Math.max(width, height) * escala);
    imagem.resize({ width: lado, height: lado, fit: "inside" });
  }
  return imagem.webp({ quality: QUALIDADE }).toBuffer();
}

async function tempoConverter() {
  const refs = await lerReferencias();

  const usos = [];
  for (const p of refs.produtos) {
    for (const c of p.imagens ?? []) {
      if (precisaConverter(c)) usos.push({ onde: `vestido   ${p.nome}`, caminho: c });
    }
  }
  for (const c of refs.categorias) {
    if (precisaConverter(c.imagem_capa)) usos.push({ onde: `colecao   ${c.nome} (capa)`, caminho: c.imagem_capa });
    if (precisaConverter(c.imagem_hero)) usos.push({ onde: `colecao   ${c.nome} (topo)`, caminho: c.imagem_hero });
  }
  for (const m of refs.midias) {
    if (precisaConverter(m.arquivo)) usos.push({ onde: `home      ${m.tipo}`, caminho: m.arquivo });
  }

  const caminhos = [...new Set(usos.map((u) => u.caminho))];

  console.log(`\n${aplicar ? "CONVERTENDO" : "SIMULACAO (nada sera gravado)"}`);
  console.log(`${caminhos.length} arquivos fora do webp, usados em ${usos.length} lugares:\n`);
  for (const u of usos) console.log(`  ${u.onde.padEnd(42)} ${u.caminho}`);

  if (!caminhos.length) {
    console.log("  nada a converter.\n");
    return;
  }

  if (!aplicar) {
    console.log("\nPara converter de verdade, rode de novo com --aplicar.\n");
    return;
  }

  // Passo 1: grava o webp de cada arquivo. `upsert` porque o nome é derivado
  // do original: o que já estiver lá é a mesma foto — da conversão de 17/09,
  // ou de uma rodada anterior que parou no meio — e nunca foto de outra peça.
  console.log("\nGravando os webp:");
  const convertidos = new Map(); // caminho antigo -> novo
  let bytesAntes = 0;
  let bytesDepois = 0;

  for (const caminho of caminhos) {
    const { data: original, error: erroDownload } = await supabase.storage
      .from(BUCKET)
      .download(caminho);
    if (erroDownload || !original) {
      console.log(`  FALHA  ${caminho} — nao foi possivel baixar`);
      continue;
    }

    try {
      const entrada = Buffer.from(await original.arrayBuffer());
      const webp = await converter(entrada);
      const novo = paraWebp(caminho);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(novo, webp, { contentType: "image/webp", upsert: true });
      if (error) throw new Error(error.message);

      convertidos.set(caminho, novo);
      bytesAntes += entrada.length;
      bytesDepois += webp.length;
      console.log(`  ok     ${novo}  (${Math.round(entrada.length / 1024)} kB -> ${Math.round(webp.length / 1024)} kB)`);
    } catch (erro) {
      console.log(`  FALHA  ${caminho} — ${erro.message}`);
    }
  }

  // Passo 2: troca os caminhos no banco. Só depois de o webp existir: se o
  // script parar no meio, o banco nunca aponta para um arquivo que não há.
  console.log("\nAtualizando o banco:");
  const trocar = (c) => convertidos.get(c) ?? c;
  let linhas = 0;
  let falhasBanco = 0;

  const atualizar = async (tabela, id, campos, rotulo) => {
    const { error } = await supabase.from(tabela).update(campos).eq("id", id);
    if (error) {
      falhasBanco += 1;
      console.log(`  FALHA  ${rotulo} — ${error.message}`);
    } else {
      linhas += 1;
      console.log(`  ok     ${rotulo}`);
    }
  };

  for (const p of refs.produtos) {
    const imagens = p.imagens ?? [];
    if (imagens.some((c) => convertidos.has(c))) {
      await atualizar("produtos", p.id, { imagens: imagens.map(trocar) }, `vestido ${p.nome}`);
    }
  }
  for (const c of refs.categorias) {
    if (convertidos.has(c.imagem_capa) || convertidos.has(c.imagem_hero)) {
      await atualizar(
        "categorias",
        c.id,
        { imagem_capa: c.imagem_capa && trocar(c.imagem_capa), imagem_hero: c.imagem_hero && trocar(c.imagem_hero) },
        `colecao ${c.nome}`,
      );
    }
  }
  for (const m of refs.midias) {
    if (convertidos.has(m.arquivo)) {
      await atualizar("midias", m.id, { arquivo: trocar(m.arquivo) }, `home ${m.tipo}`);
    }
  }

  const falhasArquivo = caminhos.length - convertidos.size;
  console.log(
    `\n${convertidos.size} de ${caminhos.length} convertidos ` +
      `(${(bytesAntes / 1048576).toFixed(1)} MB -> ${(bytesDepois / 1048576).toFixed(1)} MB), ` +
      `${linhas} linhas do banco atualizadas.`,
  );
  if (falhasArquivo || falhasBanco) {
    console.log("Houve falhas. Rodar de novo com --aplicar retoma de onde parou.");
  }
  console.log(
    "\nOs JPEGs continuam no bucket. Depois de uma hora (ou de um deploy), rode:\n" +
      "  node --env-file=.env.local scripts/converter-para-webp.mjs --apagar-originais\n",
  );
  process.exitCode = falhasArquivo || falhasBanco ? 1 : 0;
}

/* -------------------------------------------------------------------------- */
/* Tempo 2: apagar os originais já convertidos                                */
/* -------------------------------------------------------------------------- */

async function listarPasta(pasta) {
  const nomes = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(pasta, { limit: 1000, offset });
    if (error) {
      console.error(`Falha ao listar ${pasta}/:`, error.message);
      process.exit(1);
    }
    nomes.push(...data.map((o) => `${pasta}/${o.name}`));
    if (data.length < 1000) return nomes;
  }
}

async function tempoApagar() {
  const usados = todosOsCaminhos(await lerReferencias());
  const noBucket = new Set((await Promise.all(PASTAS.map(listarPasta))).flat());

  const apagaveis = [...noBucket].filter(
    (c) => NAO_WEBP.test(c) && noBucket.has(paraWebp(c)) && !usados.has(c),
  );
  const presos = [...noBucket].filter(
    (c) => NAO_WEBP.test(c) && noBucket.has(paraWebp(c)) && usados.has(c),
  );

  console.log(`\n${aplicar ? "APAGANDO" : "SIMULACAO (nada sera apagado)"}`);
  console.log(`${apagaveis.length} originais ja convertidos e sem uso:\n`);
  for (const c of apagaveis) console.log(`  ${c}`);

  if (presos.length) {
    console.log(`\n${presos.length} tem webp ao lado mas AINDA sao usados no banco, e ficam:`);
    for (const c of presos) console.log(`  ${c}`);
  }

  if (!apagaveis.length) {
    console.log("  nada a apagar.\n");
    return;
  }

  if (!aplicar) {
    console.log("\nPara apagar de verdade, rode de novo com --apagar-originais --aplicar.\n");
    return;
  }

  // Em lotes: a API de remoção aceita vários de uma vez, mas não sem limite.
  let apagados = 0;
  for (let i = 0; i < apagaveis.length; i += 100) {
    const lote = apagaveis.slice(i, i + 100);
    const { error } = await supabase.storage.from(BUCKET).remove(lote);
    if (error) {
      console.log(`  FALHA  lote ${i / 100 + 1} — ${error.message}`);
    } else {
      apagados += lote.length;
    }
  }
  console.log(`\n${apagados} de ${apagaveis.length} originais apagados.\n`);
  process.exitCode = apagados === apagaveis.length ? 0 : 1;
}

if (apagarOriginais) {
  await tempoApagar();
} else {
  await tempoConverter();
}
