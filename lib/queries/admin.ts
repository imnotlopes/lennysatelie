import { createClient } from "@/lib/supabase/server";
import type { Categoria, ProdutoComCategoria } from "@/lib/supabase/types";

/**
 * Leituras do painel.
 *
 * Diferente das queries do site: usa o cliente com sessão e NÃO filtra por
 * `ativo`. A dona precisa ver e editar as peças que estão fora do ar — é
 * justamente onde ela mexe.
 */

export async function getProdutosAdmin(): Promise<ProdutoComCategoria[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("*, categoria:categorias(id, nome, slug)")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar os vestidos: ${error.message}`);
  }
  return (data ?? []) as unknown as ProdutoComCategoria[];
}

export async function getProdutoAdminPorId(
  id: string,
): Promise<ProdutoComCategoria | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("*, categoria:categorias(id, nome, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao carregar o vestido: ${error.message}`);
  }
  return (data as unknown as ProdutoComCategoria | null) ?? null;
}

export async function getCategoriasAdmin(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar categorias: ${error.message}`);
  }
  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Cupons com desempenho                                                      */
/* -------------------------------------------------------------------------- */

export interface CupomComMetrica {
  id: string;
  codigo: string;
  influenciadora_nome: string | null;
  influenciadora_instagram: string | null;
  tipo_desconto: "percentual" | "fixo";
  valor: number;
  ativo: boolean;
  inicio: string | null;
  validade: string | null;
  limite_usos: number | null;
  usos: number;
  /** Sessões que chegaram pelo link do cupom. */
  visitas: number;
  /** Cliques no WhatsApp carregando o cupom. */
  cliques: number;
}

/**
 * Cupons com o desempenho de cada um.
 *
 * "Visitas" são eventos `cupom_aplicado`: uma por sessão que chegou pelo link.
 * "Cliques" são `clique_whatsapp` carregando o cupom. `usos` é o contador
 * manual — aluguel confirmado acontece fora do site, então quem marca é a
 * dona, na própria tabela.
 */
export async function getCuponsComMetrica(): Promise<CupomComMetrica[]> {
  const supabase = await createClient();

  const [cupons, eventos] = await Promise.all([
    supabase.from("cupons").select("*").order("created_at", { ascending: false }),
    supabase.from("eventos").select("tipo, cupom_id").not("cupom_id", "is", null),
  ]);

  if (cupons.error) {
    throw new Error(`Falha ao listar cupons: ${cupons.error.message}`);
  }

  const visitas = new Map<string, number>();
  const cliques = new Map<string, number>();

  for (const e of eventos.data ?? []) {
    if (!e.cupom_id) continue;
    const alvo = e.tipo === "clique_whatsapp" ? cliques : e.tipo === "cupom_aplicado" ? visitas : null;
    if (alvo) alvo.set(e.cupom_id, (alvo.get(e.cupom_id) ?? 0) + 1);
  }

  return (cupons.data ?? []).map((c) => ({
    ...c,
    visitas: visitas.get(c.id) ?? 0,
    cliques: cliques.get(c.id) ?? 0,
  }));
}

export async function getCupomPorId(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar o cupom: ${error.message}`);
  return data;
}

/* -------------------------------------------------------------------------- */
/* Categorias com contagem                                                    */
/* -------------------------------------------------------------------------- */

export interface CategoriaComTotal extends Categoria {
  /** Quantas peças usam esta categoria. Zero libera a exclusão. */
  totalProdutos: number;
}

export async function getCategoriasComTotal(): Promise<CategoriaComTotal[]> {
  const supabase = await createClient();

  const [categorias, produtos] = await Promise.all([
    supabase.from("categorias").select("*").order("ordem", { ascending: true }),
    supabase.from("produtos").select("categoria_id"),
  ]);

  if (categorias.error) {
    throw new Error(`Falha ao listar categorias: ${categorias.error.message}`);
  }

  const contagem = new Map<string, number>();
  for (const p of produtos.data ?? []) {
    if (p.categoria_id) {
      contagem.set(p.categoria_id, (contagem.get(p.categoria_id) ?? 0) + 1);
    }
  }

  return (categorias.data ?? []).map((c) => ({
    ...c,
    totalProdutos: contagem.get(c.id) ?? 0,
  }));
}

/* -------------------------------------------------------------------------- */
/* Configurações                                                              */
/* -------------------------------------------------------------------------- */

export async function getConfiguracoesBrutas(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("configuracoes").select("chave, valor");

  if (error) throw new Error(`Falha ao ler configurações: ${error.message}`);

  const mapa: Record<string, unknown> = {};
  for (const linha of data ?? []) mapa[linha.chave] = linha.valor;
  return mapa;
}
