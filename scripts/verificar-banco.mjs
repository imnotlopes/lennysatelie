/**
 * Confere se o banco está de pé e se a RLS faz o que deveria.
 *
 * Uso:
 *   npm run verificar-banco
 *
 * Conecta com a chave anônima, ou seja, enxerga exatamente o que uma visitante
 * do site enxerga. Não escreve nada além de um evento de teste, que ele mesmo
 * conta no fim.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let falhas = 0;

const ok = (msg) => console.log(`  ok    ${msg}`);
const erro = (msg) => {
  falhas += 1;
  console.log(`  FALHA ${msg}`);
};
const info = (msg) => console.log(`        ${msg}`);

if (!url || !key) {
  console.log("\nO .env.local nao esta preenchido.\n");
  console.log("  NEXT_PUBLIC_SUPABASE_URL:      " + (url ? "ok" : "VAZIA"));
  console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY: " + (key ? "ok" : "VAZIA"));
  console.log(
    "\nPegue os dois valores em Project Settings > API no painel do Supabase.\n" +
      "A URL tem o formato https://xxxxxxxx.supabase.co e a chave e a anon/public.\n",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

console.log(`\nConectando em ${url}\n`);

/* -------------------------------------------------------------------------- */
/* 1. As tabelas existem e o seed rodou                                       */
/* -------------------------------------------------------------------------- */

console.log("Tabelas e seed");

const esperado = {
  categorias: 2,
  produtos: 50,
  configuracoes: 2,
};

for (const [tabela, quantidade] of Object.entries(esperado)) {
  const { count, error } = await supabase
    .from(tabela)
    .select("*", { count: "exact", head: true });

  if (error) {
    erro(`${tabela}: ${error.message}`);
  } else if (count === quantidade) {
    ok(`${tabela}: ${count} registros`);
  } else {
    erro(`${tabela}: ${count} registros, esperava ${quantidade}`);
    info("o seed.sql provavelmente nao rodou, ou rodou pela metade");
  }
}

/* -------------------------------------------------------------------------- */
/* 2. O join produto -> categoria funciona                                    */
/* -------------------------------------------------------------------------- */

console.log("\nConsulta principal (getProdutos)");

const { data: produtos, error: erroProdutos } = await supabase
  .from("produtos")
  .select("*, categoria:categorias(id, nome, slug)")
  .eq("ativo", true)
  .order("destaque", { ascending: false })
  .order("ordem", { ascending: true });

if (erroProdutos) {
  erro(erroProdutos.message);
} else if (produtos.length !== 50) {
  erro(`retornou ${produtos.length} produtos, esperava 50`);
} else {
  ok(`${produtos.length} produtos`);

  const semCategoria = produtos.filter((p) => !p.categoria);
  if (semCategoria.length) {
    erro(`${semCategoria.length} produto(s) sem categoria resolvida no join`);
  } else {
    ok("todos com a categoria resolvida pelo join");
  }

  const destaques = produtos.filter((p) => p.destaque);
  ok(`${destaques.length} em destaque`);
  const promos = produtos.filter((p) => p.preco_original);
  ok(`${promos.length} com preco promocional`);
  info(produtos.slice(0, 5).map((p) => `${p.nome} — R$ ${p.preco_locacao}`).join("\n        ") + "\n        ...");
}

/* -------------------------------------------------------------------------- */
/* 3. Filtro por categoria com inner join                                     */
/* -------------------------------------------------------------------------- */

console.log("\nFiltro por categoria");

const { data: bordados, error: erroFiltro } = await supabase
  .from("produtos")
  .select("*, categoria:categorias!inner(id, nome, slug)")
  .eq("ativo", true)
  .eq("categoria.slug", "festa");

if (erroFiltro) {
  erro(erroFiltro.message);
} else if (bordados.length === 21) {
  ok(`categoria "festa": ${bordados.length} produtos`);
} else {
  erro(`categoria "festa": ${bordados.length} produtos, esperava 21`);
  info("se vier 50, o !inner nao esta filtrando");
}

/* -------------------------------------------------------------------------- */
/* 4. RLS: o que o publico NAO pode ver                                       */
/* -------------------------------------------------------------------------- */

console.log("\nRLS");

// 4a. cupom valido volta, com as colunas publicas
const { data: cupom, error: erroCupom } = await supabase
  .from("cupons")
  .select("id, codigo, influenciadora_nome, tipo_desconto, valor, ativo, validade, limite_usos, usos")
  .eq("codigo", "MARIANA10")
  .maybeSingle();

if (erroCupom) {
  erro(`leitura de cupom valido: ${erroCupom.message}`);
} else if (cupom) {
  ok(`cupom MARIANA10 encontrado (${cupom.valor}% ${cupom.tipo_desconto})`);
} else {
  erro("cupom MARIANA10 nao encontrado");
}

// 4b. as colunas da influenciadora precisam estar bloqueadas
const { error: erroColuna } = await supabase
  .from("cupons")
  .select("codigo, influenciadora_instagram")
  .limit(1);

if (erroColuna) {
  ok("instagram da influenciadora bloqueado para o publico");
} else {
  erro("o publico conseguiu ler influenciadora_instagram — o GRANT nao foi aplicado");
}

// 4c. select * em cupons tambem deve falhar, pelo mesmo motivo
const { error: erroSelectAll } = await supabase.from("cupons").select("*").limit(1);
if (erroSelectAll) {
  ok('select * em cupons bloqueado (esperado)');
} else {
  erro("select * em cupons passou — o GRANT por coluna nao foi aplicado");
}

// 4d. escrita publica em produtos deve ser negada
const { error: erroEscrita } = await supabase
  .from("produtos")
  .insert({ nome: "teste rls", slug: `teste-rls-${Date.now()}` });

if (erroEscrita) {
  ok("escrita publica em produtos negada");
} else {
  erro("o publico conseguiu inserir produto — a policy de escrita esta aberta");
}

// 4e. leitura publica de eventos deve ser negada
const { data: eventosLidos, error: erroLerEventos } = await supabase
  .from("eventos")
  .select("id")
  .limit(1);

if (erroLerEventos || (eventosLidos && eventosLidos.length === 0)) {
  ok("leitura publica de eventos negada");
} else {
  erro("o publico conseguiu ler eventos");
}

/* -------------------------------------------------------------------------- */
/* 5. Registro de evento (insert publico)                                     */
/* -------------------------------------------------------------------------- */

console.log("\nRegistro de evento");

const { error: erroEvento } = await supabase
  .from("eventos")
  .insert({ tipo: "visita_produto", produto_id: produtos?.[0]?.id ?? null });

if (erroEvento) {
  erro(`insert de evento: ${erroEvento.message}`);
} else {
  ok("evento registrado (insert publico funciona)");
  info("isso deixou 1 linha de teste em `eventos`; pode apagar pelo painel");
}

/* -------------------------------------------------------------------------- */
/* 6. Storage                                                                  */
/* -------------------------------------------------------------------------- */

console.log("\nStorage");

const { error: erroBucket } = await supabase.storage.from("produtos").list("", {
  limit: 1,
});

if (erroBucket) {
  erro(`bucket "produtos": ${erroBucket.message}`);
  info("crie pelo painel em Storage > New bucket, marcando Public bucket");
} else {
  ok('bucket "produtos" acessivel');
}

/* -------------------------------------------------------------------------- */

console.log(
  falhas === 0
    ? "\nTudo certo. O criterio de aceite da Etapa 2 esta cumprido.\n"
    : `\n${falhas} verificacao(oes) falharam. Veja as linhas com FALHA acima.\n`,
);

process.exit(falhas === 0 ? 0 : 1);
