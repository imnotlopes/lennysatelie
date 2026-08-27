"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  centavosParaReais,
  produtoSchema,
  type ProdutoFormulario,
} from "@/lib/admin/produto-schema";

/**
 * Escrita de produtos pelo painel.
 *
 * Usa o cliente com sessão: a RLS só libera escrita para autenticado, então
 * uma chamada sem login volta com erro em vez de gravar.
 *
 * Toda operação revalida o site público, senão a peça cadastrada só apareceria
 * na próxima revalidação de hora em hora — e a dona acharia que não salvou.
 */

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
  /** Devolvido no cadastro, para a tela redirecionar para a edição. */
  id?: string;
}

function revalidarTudo(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/acervo");
  if (slug) revalidatePath(`/acervo/${slug}`);
  revalidatePath("/admin/produtos");
}

/** Mensagem de erro do Postgres traduzida para quem não é técnica. */
function traduzirErro(mensagem: string): string {
  if (mensagem.includes("produtos_slug_key") || mensagem.includes("duplicate key")) {
    return "Já existe um vestido com esse endereço de página. Mude o campo Endereço da página.";
  }
  if (mensagem.includes("produtos_preco_original_maior")) {
    return "O preço antigo precisa ser maior que o preço atual.";
  }
  return "Não foi possível salvar. Tente de novo em instantes.";
}

function paraBanco(dados: ProdutoFormulario) {
  return {
    nome: dados.nome,
    slug: dados.slug,
    descricao: dados.descricao?.trim() || null,
    preco_locacao: centavosParaReais(dados.precoCentavos),
    preco_original: centavosParaReais(dados.precoOriginalCentavos ?? null),
    categoria_id: dados.categoriaId,
    cor: dados.cor?.trim() || null,
    tamanho: dados.tamanhos,
    imagens: dados.imagens,
    ativo: dados.ativo,
    destaque: dados.destaque,
  };
}

export async function criarProduto(
  dados: ProdutoFormulario,
): Promise<ResultadoAcao> {
  const validado = produtoSchema.safeParse(dados);
  if (!validado.success) {
    return { ok: false, erro: "Confira os campos destacados." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert(paraBanco(validado.data))
    .select("id, slug")
    .single();

  if (error) return { ok: false, erro: traduzirErro(error.message) };

  revalidarTudo(data.slug);
  return { ok: true, id: data.id };
}

export async function atualizarProduto(
  id: string,
  dados: ProdutoFormulario,
): Promise<ResultadoAcao> {
  const validado = produtoSchema.safeParse(dados);
  if (!validado.success) {
    return { ok: false, erro: "Confira os campos destacados." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .update(paraBanco(validado.data))
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, erro: traduzirErro(error.message) };

  revalidarTudo(data.slug);
  return { ok: true, id };
}

/** Liga e desliga direto na tabela da listagem. */
export async function alternarCampo(
  id: string,
  campo: "ativo" | "destaque",
  valor: boolean,
): Promise<ResultadoAcao> {
  const supabase = await createClient();

  // Chave computada perde o tipo na inferencia do supabase-js, entao a
  // mudanca e montada explicitamente.
  const mudanca = campo === "ativo" ? { ativo: valor } : { destaque: valor };

  const { data, error } = await supabase
    .from("produtos")
    .update(mudanca)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, erro: "Não foi possível salvar a mudança." };

  revalidarTudo(data.slug);
  return { ok: true };
}

/**
 * Apaga a peça e as fotos dela no Storage.
 *
 * As fotos saem primeiro: se a linha sumisse antes, os caminhos das imagens
 * iriam junto e os arquivos ficariam órfãos no bucket para sempre.
 */
export async function excluirProduto(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const { data: produto, error: erroLeitura } = await supabase
    .from("produtos")
    .select("slug, imagens")
    .eq("id", id)
    .single();

  if (erroLeitura) {
    return { ok: false, erro: "Não encontramos esse vestido." };
  }

  const caminhos = (produto.imagens ?? []).filter(
    (c: string) => c && !c.startsWith("http"),
  );

  if (caminhos.length) {
    const { error } = await supabase.storage.from("produtos").remove(caminhos);
    // Falha ao apagar arquivo não impede apagar a peça: melhor um arquivo
    // órfão no bucket do que uma peça que não sai do site.
    if (error) {
      console.error("Falha ao apagar imagens do produto:", error.message);
    }
  }

  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível excluir o vestido." };

  revalidarTudo(produto.slug);
  return { ok: true };
}
