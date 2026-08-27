"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gerarSlug } from "@/lib/admin/produto-schema";
import type { ResultadoAcao } from "./admin-produtos";

/* -------------------------------------------------------------------------- */
/* Categorias                                                                 */
/* -------------------------------------------------------------------------- */

export interface DadosCategoria {
  nome: string;
  slug: string;
  imagemCapa: string;
  ordem: number;
}

function revalidarSite() {
  revalidatePath("/", "layout");
  revalidatePath("/acervo");
  // As configuracoes ficam em cache proprio, por tag: sem isto a dona salva o
  // telefone novo e o rodape continua com o antigo por ate uma hora.
  //
  // `updateTag` e nao `revalidateTag`: o segundo serve conteudo velho uma vez
  // enquanto busca o novo por tras. Para quem acabou de salvar, ver o valor
  // antigo parece que o salvamento falhou.
  updateTag("configuracoes");
}

export async function salvarCategoria(
  id: string | null,
  dados: DadosCategoria,
): Promise<ResultadoAcao> {
  const nome = dados.nome.trim();
  if (nome.length < 2) {
    return { ok: false, erro: "Escreva o nome da categoria." };
  }

  const slug = gerarSlug(dados.slug.trim() || nome);
  if (!slug) {
    return { ok: false, erro: "O endereço da categoria não pode ficar vazio." };
  }

  const supabase = await createClient();
  const linha = {
    nome,
    slug,
    imagem_capa: dados.imagemCapa.trim() || null,
    ordem: dados.ordem,
  };

  const { error } = id
    ? await supabase.from("categorias").update(linha).eq("id", id)
    : await supabase.from("categorias").insert(linha);

  if (error) {
    if (error.message.includes("duplicate key")) {
      return { ok: false, erro: `Já existe uma categoria com o endereço "${slug}".` };
    }
    return { ok: false, erro: "Não foi possível salvar a categoria." };
  }

  revalidarSite();
  revalidatePath("/admin/categorias");
  return { ok: true };
}

/**
 * Exclusão de categoria.
 *
 * Barrada quando há peças vinculadas: apagar aqui deixaria os vestidos sem
 * categoria e eles sumiriam dos filtros do acervo sem ninguém entender por quê.
 */
export async function excluirCategoria(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("produtos")
    .select("id", { count: "exact", head: true })
    .eq("categoria_id", id);

  if (count && count > 0) {
    return {
      ok: false,
      erro: `Esta categoria tem ${count} vestido(s). Mova essas peças para outra categoria antes de apagar.`,
    };
  }

  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível excluir a categoria." };

  revalidarSite();
  revalidatePath("/admin/categorias");
  return { ok: true };
}

/** Grava a nova ordem depois de arrastar. */
export async function reordenarCategorias(
  ids: string[],
): Promise<ResultadoAcao> {
  const supabase = await createClient();

  for (const [indice, id] of ids.entries()) {
    const { error } = await supabase
      .from("categorias")
      .update({ ordem: indice + 1 })
      .eq("id", id);
    if (error) return { ok: false, erro: "Não foi possível salvar a ordem." };
  }

  revalidarSite();
  revalidatePath("/admin/categorias");
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Configurações                                                              */
/* -------------------------------------------------------------------------- */

export interface DadosConfiguracoes {
  whatsapp: string;
  telefone: string;
  email: string;
  endereco: string;
  instagram: string;
  facebook: string;
  template: string;
}

export async function salvarConfiguracoes(
  dados: DadosConfiguracoes,
): Promise<ResultadoAcao> {
  const digitos = dados.whatsapp.replace(/\D/g, "");
  if (digitos.length < 12) {
    return {
      ok: false,
      erro: "O WhatsApp precisa ter o código do país. Ex.: 5511958564840.",
    };
  }
  if (!dados.template.includes("{nome}")) {
    return {
      ok: false,
      erro: "A mensagem precisa conter {nome}, senão a cliente não diz qual vestido quer.",
    };
  }

  const supabase = await createClient();

  const linhas = [
    {
      chave: "contato",
      valor: {
        whatsapp: digitos,
        telefone: dados.telefone.trim(),
        email: dados.email.trim(),
        endereco: dados.endereco.trim(),
        instagram: dados.instagram.trim(),
        facebook: dados.facebook.trim(),
      },
    },
    { chave: "whatsapp_template", valor: { mensagem: dados.template.trim() } },
  ];

  const { error } = await supabase.from("configuracoes").upsert(linhas);
  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidarSite();
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}
