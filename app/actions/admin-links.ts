"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IconeLink } from "@/lib/supabase/types";

/**
 * A página de links, editada pelo painel.
 *
 * POR QUE TODO SALVAR DERRUBA A ETIQUETA DE CACHE
 * -----------------------------------------------
 * A página lê por `unstable_cache` com cinco minutos de validade. Sem derrubar
 * a etiqueta, a Lennys troca um texto, abre a página, vê o texto antigo e
 * conclui que o painel não funciona. Aconteceu comigo durante a construção:
 * passei um tempo procurando bug onde havia só cache.
 *
 * `revalidatePath` sozinho não basta, porque quem guarda o dado é a consulta e
 * não a rota. E é `updateTag` e não `revalidateTag` pelo mesmo motivo que o
 * `admin-geral.ts` explica: o segundo serve o conteúdo velho uma vez enquanto
 * busca o novo por trás, e para quem acabou de salvar isso parece falha.
 */

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
}

export interface DadosLink {
  titulo: string;
  subtitulo: string;
  icone: IconeLink;
  url: string;
}

const LIMITE_TITULO = 28;
const LIMITE_SUBTITULO = 34;

function revalidar() {
  updateTag("links");
  revalidatePath("/admin/links");
  revalidatePath("/links");
}

/**
 * O que a dona do ateliê pode escrever.
 *
 * Os limites não são capricho: o título e o subtítulo moram num card estreito,
 * e texto longo quebra em duas linhas e deixa aquele card mais alto que os
 * outros. Medi em 375px — 28 e 34 são o que cabe numa linha.
 *
 * A mensagem diz o que fazer, não o que ela errou.
 */
function validar(dados: DadosLink): string | null {
  const titulo = dados.titulo.trim();
  const url = dados.url.trim();

  if (!titulo) return "Escreva o nome do botão.";
  if (titulo.length > LIMITE_TITULO) {
    return `O nome precisa caber numa linha: até ${LIMITE_TITULO} letras.`;
  }
  if (dados.subtitulo.trim().length > LIMITE_SUBTITULO) {
    return `A frase de baixo precisa caber numa linha: até ${LIMITE_SUBTITULO} letras.`;
  }
  if (!url) return "Cole o endereço para onde o botão leva.";

  // `mailto:` é endereço legítimo aqui e não passa em `new URL` como http.
  if (!url.startsWith("mailto:")) {
    try {
      const endereco = new URL(url);
      if (endereco.protocol !== "https:" && endereco.protocol !== "http:") {
        return "O endereço precisa começar com https://";
      }
    } catch {
      return "O endereço precisa começar com https://";
    }
  }

  return null;
}

export async function salvarLink(
  id: string,
  dados: DadosLink,
): Promise<ResultadoAcao> {
  const problema = validar(dados);
  if (problema) return { ok: false, erro: problema };

  const supabase = await createClient();
  const { error } = await supabase
    .from("links")
    .update({
      titulo: dados.titulo.trim(),
      subtitulo: dados.subtitulo.trim() || null,
      icone: dados.icone,
      url: dados.url.trim(),
    })
    .eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true };
}

/** Liga ou desliga o botão. Desligado, ele some da página e do rodapé. */
export async function alternarLink(
  id: string,
  ativo: boolean,
): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("links").update({ ativo }).eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true };
}

/**
 * Marca o botão em destaque — o preto, no topo.
 *
 * Desliga os outros na mesma ação, e é por isso que são duas escritas e não
 * uma. Dois destaques ao mesmo tempo não seriam destaque nenhum: a página
 * mostraria dois cards pretos e a visitante não saberia qual é o principal.
 */
export async function destacarLink(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const { error: erroLimpar } = await supabase
    .from("links")
    .update({ destaque: false })
    .neq("id", id);

  if (erroLimpar) return { ok: false, erro: "Não foi possível salvar." };

  const { error } = await supabase
    .from("links")
    .update({ destaque: true })
    .eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true };
}

/** Troca a posição de dois botões, para a lista sair na ordem que ela quer. */
export async function moverLink(
  id: string,
  ordem: number,
  idVizinho: string,
  ordemVizinha: number,
): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const [a, b] = await Promise.all([
    supabase.from("links").update({ ordem: ordemVizinha }).eq("id", id),
    supabase.from("links").update({ ordem }).eq("id", idVizinho),
  ]);

  if (a.error || b.error) return { ok: false, erro: "Não foi possível mover." };

  revalidar();
  return { ok: true };
}
