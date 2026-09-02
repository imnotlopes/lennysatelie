import type { OrdenacaoProduto, ProdutoFiltros } from "@/lib/queries";

/**
 * Tradução entre a URL e os filtros do acervo.
 *
 * O estado inteiro vive na query string, não em estado de componente. É o que
 * torna o link colável no WhatsApp e a página indexável — e é por isso que
 * esta tradução mora em /lib e não dentro do componente.
 */

/** Quantas peças o "Carregar mais" acrescenta por vez. */
export const PASSO_PAGINA = 12;

export const ORDENACOES = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "menor-preco", rotulo: "Menor preço" },
  { valor: "maior-preco", rotulo: "Maior preço" },
] as const;

export type OrdemAcervo = (typeof ORDENACOES)[number]["valor"];

export interface EstadoAcervo {
  categorias: string[];
  cores: string[];
  tamanhos: string[];
  precoMin?: number;
  precoMax?: number;
  busca?: string;
  ordem: OrdemAcervo;
  mostrar: number;
}

/** O que o Next entrega em `searchParams`. */
export type SearchParams = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined): string | undefined {
  if (Array.isArray(valor)) return valor[0];
  return valor;
}

function lista(valor: string | string[] | undefined): string[] {
  const bruto = primeiro(valor);
  if (!bruto) return [];
  return bruto
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function inteiro(valor: string | undefined): number | undefined {
  if (!valor) return undefined;
  const n = Number.parseInt(valor, 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Lê a URL. Valor inválido é ignorado em silêncio, nunca quebra a página. */
export function lerEstado(params: SearchParams): EstadoAcervo {
  const preco = primeiro(params.preco);
  const [minBruto, maxBruto] = (preco ?? "").split("-");

  const ordemBruta = primeiro(params.ordem);
  const ordem = ORDENACOES.some((o) => o.valor === ordemBruta)
    ? (ordemBruta as OrdemAcervo)
    : "recentes";

  const mostrar = inteiro(primeiro(params.mostrar)) ?? PASSO_PAGINA;

  return {
    categorias: lista(params.categoria),
    cores: lista(params.cor),
    tamanhos: lista(params.tamanho),
    precoMin: inteiro(minBruto),
    precoMax: inteiro(maxBruto),
    busca: primeiro(params.busca)?.trim() || undefined,
    ordem,
    mostrar: Math.max(PASSO_PAGINA, mostrar),
  };
}

const MAPA_ORDENACAO: Record<OrdemAcervo, OrdenacaoProduto> = {
  recentes: "recentes",
  "menor-preco": "preco-asc",
  "maior-preco": "preco-desc",
};

/** Converte o estado da URL no formato que `getAcervo` espera. */
export function paraFiltros(estado: EstadoAcervo): ProdutoFiltros {
  return {
    categorias: estado.categorias,
    cores: estado.cores,
    tamanhos: estado.tamanhos,
    precoMin: estado.precoMin,
    precoMax: estado.precoMax,
    busca: estado.busca,
    ordenacao: MAPA_ORDENACAO[estado.ordem],
    limite: estado.mostrar,
    offset: 0,
  };
}

/**
 * Escreve o estado de volta na URL.
 *
 * Só grava o que difere do padrão, para o link ficar curto e legível quando
 * a cliente cola no WhatsApp.
 */
export function escreverEstado(estado: EstadoAcervo): string {
  const params = new URLSearchParams();

  if (estado.categorias.length) params.set("categoria", estado.categorias.join(","));
  if (estado.cores.length) params.set("cor", estado.cores.join(","));
  if (estado.tamanhos.length) params.set("tamanho", estado.tamanhos.join(","));
  if (estado.precoMin !== undefined || estado.precoMax !== undefined) {
    params.set("preco", `${estado.precoMin ?? ""}-${estado.precoMax ?? ""}`);
  }
  if (estado.busca) params.set("busca", estado.busca);
  if (estado.ordem !== "recentes") params.set("ordem", estado.ordem);
  if (estado.mostrar !== PASSO_PAGINA) params.set("mostrar", String(estado.mostrar));

  const query = params.toString();
  return query ? `/acervo?${query}` : "/acervo";
}

/** Há algum filtro aplicado? Controla o botão "Limpar filtros". */
export function temFiltroAtivo(estado: EstadoAcervo): boolean {
  return Boolean(
    estado.categorias.length ||
      estado.cores.length ||
      estado.tamanhos.length ||
      estado.precoMin !== undefined ||
      estado.precoMax !== undefined ||
      estado.busca,
  );
}

/**
 * Há filtro além da coleção escolhida?
 *
 * Serve para decidir se o acervo mostra a capa da coleção. Com cor ou tamanho
 * ligados junto, o que está listado deixa de ser "a coleção inteira" e a capa
 * passaria a prometer mais do que a página entrega.
 */
export function temFiltroAlemDaCategoria(estado: EstadoAcervo): boolean {
  return Boolean(
    estado.cores.length ||
      estado.tamanhos.length ||
      estado.precoMin !== undefined ||
      estado.precoMax !== undefined ||
      estado.busca,
  );
}

/** Liga ou desliga um valor de um filtro de múltipla escolha. */
export function alternar(atual: string[], valor: string): string[] {
  return atual.includes(valor)
    ? atual.filter((v) => v !== valor)
    : [...atual, valor];
}

/**
 * Quantos filtros estão ligados. Vira o contador do botão "Filtrar" no mobile.
 *
 * Mora aqui, e não no componente, porque a página é Server Component e um
 * módulo marcado "use client" não exporta função chamável pelo servidor.
 */
export function contarAtivos(estado: EstadoAcervo): number {
  if (!temFiltroAtivo(estado)) return 0;
  return (
    estado.categorias.length +
    estado.cores.length +
    estado.tamanhos.length +
    (estado.precoMin !== undefined || estado.precoMax !== undefined ? 1 : 0) +
    (estado.busca ? 1 : 0)
  );
}
