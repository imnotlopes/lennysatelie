import { reaisParaCentavos, type ProdutoFormulario } from "./produto-schema";
import type { ProdutoComCategoria } from "@/lib/supabase/types";

/** Peça nova: já nasce visível no site, que é o caso comum. */
export const PRODUTO_VAZIO: ProdutoFormulario = {
  nome: "",
  slug: "",
  descricao: "",
  precoCentavos: null,
  precoOriginalCentavos: null,
  categoriaId: null,
  cor: "",
  tamanhos: [],
  imagens: [],
  ativo: true,
  destaque: false,
};

export function produtoParaFormulario(
  produto: ProdutoComCategoria,
): ProdutoFormulario {
  return {
    nome: produto.nome,
    slug: produto.slug,
    descricao: produto.descricao ?? "",
    precoCentavos: reaisParaCentavos(produto.preco_locacao),
    precoOriginalCentavos: reaisParaCentavos(produto.preco_original),
    categoriaId: produto.categoria_id,
    cor: produto.cor ?? "",
    tamanhos: produto.tamanho ?? [],
    imagens: produto.imagens ?? [],
    ativo: produto.ativo,
    destaque: produto.destaque,
  };
}
