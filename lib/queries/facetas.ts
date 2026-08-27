import { createPublicClient } from "@/lib/supabase/public";

export interface OpcaoFaceta {
  valor: string;
  rotulo: string;
  /** Quantas peças ativas têm este valor. */
  total: number;
}

export interface Facetas {
  categorias: OpcaoFaceta[];
  cores: OpcaoFaceta[];
  tamanhos: OpcaoFaceta[];
  precoMin: number;
  precoMax: number;
  total: number;
}

/**
 * Opções disponíveis para os filtros do acervo, com contagem.
 *
 * Derivadas do acervo real em vez de uma lista fixa: cor que ninguém tem não
 * aparece como filtro, e o slider de preço nasce na faixa que existe de fato.
 *
 * Traz só as colunas necessárias das peças ativas. Para um acervo desta ordem
 * de grandeza isso é uma consulta só; se um dia passar de alguns milhares de
 * peças, vira uma view materializada ou uma RPC de agregação.
 */
export async function getFacetas(): Promise<Facetas> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("produtos")
    .select("preco_locacao, cor, tamanho, categoria:categorias(nome, slug)")
    .eq("ativo", true);

  if (error) {
    throw new Error(`Falha ao montar os filtros: ${error.message}`);
  }

  const linhas = (data ?? []) as unknown as Array<{
    preco_locacao: number | null;
    cor: string | null;
    tamanho: string[];
    categoria: { nome: string; slug: string } | null;
  }>;

  const categorias = new Map<string, OpcaoFaceta>();
  const cores = new Map<string, OpcaoFaceta>();
  const tamanhos = new Map<string, OpcaoFaceta>();

  let precoMin = Number.POSITIVE_INFINITY;
  let precoMax = 0;

  for (const linha of linhas) {
    if (linha.categoria) {
      const atual = categorias.get(linha.categoria.slug);
      if (atual) {
        atual.total += 1;
      } else {
        categorias.set(linha.categoria.slug, {
          valor: linha.categoria.slug,
          rotulo: linha.categoria.nome,
          total: 1,
        });
      }
    }

    if (linha.cor) {
      const chave = linha.cor;
      const atual = cores.get(chave);
      if (atual) {
        atual.total += 1;
      } else {
        cores.set(chave, { valor: chave, rotulo: chave, total: 1 });
      }
    }

    for (const tamanho of linha.tamanho ?? []) {
      const atual = tamanhos.get(tamanho);
      if (atual) {
        atual.total += 1;
      } else {
        tamanhos.set(tamanho, { valor: tamanho, rotulo: tamanho, total: 1 });
      }
    }

    // Peça sem preço cadastrado não deve puxar o mínimo do slider para zero.
    if (linha.preco_locacao !== null && linha.preco_locacao > 0) {
      precoMin = Math.min(precoMin, linha.preco_locacao);
      precoMax = Math.max(precoMax, linha.preco_locacao);
    }
  }

  const ORDEM_TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];

  return {
    categorias: [...categorias.values()],
    cores: [...cores.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR")),
    tamanhos: [...tamanhos.values()].sort(
      (a, b) => ORDEM_TAMANHOS.indexOf(a.valor) - ORDEM_TAMANHOS.indexOf(b.valor),
    ),
    precoMin: Number.isFinite(precoMin) ? Math.floor(precoMin) : 0,
    precoMax: Math.ceil(precoMax),
    total: linhas.length,
  };
}
