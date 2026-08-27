import { createPublicClient } from "@/lib/supabase/public";
import type { Produto, ProdutoComCategoria } from "@/lib/supabase/types";

const CAMPOS_COM_CATEGORIA = "*, categoria:categorias(id, nome, slug)";

export type OrdenacaoProduto =
  | "destaque"
  | "preco-asc"
  | "preco-desc"
  | "recentes";

export interface ProdutoFiltros {
  /** Slugs de categoria. Vazio ou ausente significa todas. */
  categorias?: string[];
  /** Retorna produtos que tenham ao menos um dos tamanhos. */
  tamanhos?: string[];
  cores?: string[];
  precoMin?: number;
  precoMax?: number;
  /** Busca por nome. Case-insensitive, casa com parte do nome. */
  busca?: string;
  ordenacao?: OrdenacaoProduto;
  limite?: number;
  /** Quantos registros pular. Para paginação. */
  offset?: number;
}

/**
 * Lista os produtos ativos aplicando os filtros do acervo.
 *
 * A RLS já esconde produto inativo do público, mas o filtro explícito fica
 * porque o painel usa o mesmo caminho autenticado e ali `ativo` não filtra
 * sozinho.
 */
export async function getProdutos(
  filtros: ProdutoFiltros = {},
): Promise<ProdutoComCategoria[]> {
  const { data, error } = await montarQuery(filtros);
  if (error) {
    throw new Error(`Falha ao listar produtos: ${error.message}`);
  }
  return (data ?? []) as unknown as ProdutoComCategoria[];
}

/**
 * Igual a `getProdutos`, mas devolve também quantas peças atendem aos filtros
 * ignorando o limite. É o que o acervo usa para mostrar "50 vestidos" e
 * decidir se ainda cabe um "Carregar mais".
 */
export async function getAcervo(filtros: ProdutoFiltros = {}): Promise<{
  produtos: ProdutoComCategoria[];
  total: number;
}> {
  const { data, error, count } = await montarQuery(filtros, true);
  if (error) {
    throw new Error(`Falha ao listar o acervo: ${error.message}`);
  }
  return {
    produtos: (data ?? []) as unknown as ProdutoComCategoria[],
    total: count ?? 0,
  };
}

/** Monta a consulta compartilhada por `getProdutos` e `getAcervo`. */
function montarQuery(filtros: ProdutoFiltros, comTotal = false) {
  const supabase = createPublicClient();

  // Filtrar por uma coluna do recurso embutido exige inner join no PostgREST.
  // Sem o `!inner`, o `.in` abaixo zera a categoria mas mantém o produto.
  const temCategoria = Boolean(filtros.categorias?.length);
  const campos = temCategoria
    ? "*, categoria:categorias!inner(id, nome, slug)"
    : CAMPOS_COM_CATEGORIA;

  let query = supabase
    .from("produtos")
    .select(campos, comTotal ? { count: "exact" } : undefined)
    .eq("ativo", true);

  if (filtros.categorias?.length) {
    query = query.in("categoria.slug", filtros.categorias);
  }
  if (filtros.tamanhos?.length) {
    query = query.overlaps("tamanho", filtros.tamanhos);
  }
  if (filtros.cores?.length) {
    query = query.in("cor", filtros.cores);
  }
  if (filtros.precoMin !== undefined) {
    query = query.gte("preco_locacao", filtros.precoMin);
  }
  if (filtros.precoMax !== undefined) {
    query = query.lte("preco_locacao", filtros.precoMax);
  }
  if (filtros.busca) {
    query = query.ilike("nome", `%${filtros.busca}%`);
  }

  switch (filtros.ordenacao) {
    // nullsFirst: false manda "sob consulta" para o fim nas duas direcoes.
    case "preco-asc":
      query = query.order("preco_locacao", { ascending: true, nullsFirst: false });
      break;
    case "preco-desc":
      query = query.order("preco_locacao", { ascending: false, nullsFirst: false });
      break;
    case "recentes":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("destaque", { ascending: false })
        .order("ordem", { ascending: true });
  }

  if (filtros.limite !== undefined) {
    const inicio = filtros.offset ?? 0;
    query = query.range(inicio, inicio + filtros.limite - 1);
  }

  return query;
}

/**
 * Busca um produto pelo slug da URL.
 *
 * Devolve `null` quando não existe ou está inativo, para a página conseguir
 * chamar `notFound()` em vez de estourar erro.
 */
export async function getProdutoBySlug(
  slug: string,
): Promise<ProdutoComCategoria | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("produtos")
    .select(CAMPOS_COM_CATEGORIA)
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao buscar o produto "${slug}": ${error.message}`);
  }
  return (data as unknown as ProdutoComCategoria | null) ?? null;
}

/** Produtos marcados como destaque. Alimenta a vitrine da home. */
export async function getProdutosDestaque(
  limite = 8,
): Promise<ProdutoComCategoria[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("produtos")
    .select(CAMPOS_COM_CATEGORIA)
    .eq("ativo", true)
    .eq("destaque", true)
    .order("ordem", { ascending: true })
    .limit(limite);

  if (error) {
    throw new Error(`Falha ao buscar destaques: ${error.message}`);
  }
  return (data ?? []) as unknown as ProdutoComCategoria[];
}

/**
 * Outros produtos da mesma categoria, para o rodapé da página de produto.
 * Quando o produto não tem categoria, devolve lista vazia.
 */
export async function getProdutosRelacionados(
  categoriaId: string | null,
  excluirId: string,
  limite = 4,
): Promise<ProdutoComCategoria[]> {
  if (!categoriaId) return [];

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("produtos")
    .select(CAMPOS_COM_CATEGORIA)
    .eq("ativo", true)
    .eq("categoria_id", categoriaId)
    .neq("id", excluirId)
    .order("ordem", { ascending: true })
    .limit(limite);

  if (error) {
    throw new Error(`Falha ao buscar produtos relacionados: ${error.message}`);
  }
  return (data ?? []) as unknown as ProdutoComCategoria[];
}

/**
 * Busca varias pecas de uma vez, pelos slugs.
 *
 * Devolve na ordem em que os slugs foram pedidos, e nao na ordem do banco:
 * quem chama e a secao de "vistos recentemente", onde a ordem e o historico
 * da visitante. Slug que nao existe mais (peca apagada ou desativada)
 * simplesmente nao volta.
 */
export async function getProdutosPorSlugs(
  slugs: string[],
): Promise<ProdutoComCategoria[]> {
  if (!slugs.length) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(CAMPOS_COM_CATEGORIA)
    .eq("ativo", true)
    .in("slug", slugs);

  if (error) {
    throw new Error(`Falha ao buscar as pecas vistas: ${error.message}`);
  }

  const porSlug = new Map(
    ((data ?? []) as unknown as ProdutoComCategoria[]).map((p) => [p.slug, p]),
  );
  return slugs
    .map((slug) => porSlug.get(slug))
    .filter((p): p is ProdutoComCategoria => Boolean(p));
}

/** Slugs de todos os produtos ativos. Usado para gerar rotas estáticas e sitemap. */
export async function getProdutoSlugs(): Promise<Pick<Produto, "slug">[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("slug")
    .eq("ativo", true);

  if (error) {
    throw new Error(`Falha ao listar slugs de produtos: ${error.message}`);
  }
  return data ?? [];
}
