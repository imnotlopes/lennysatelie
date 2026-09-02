"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * O catálogo de etiquetas do painel.
 *
 * Antes as cinco sugestões viviam fixas no código do formulário. Trocar
 * "Promoção" por "Últimas peças" exigia um desenvolvedor, o que contraria a
 * ideia do painel: a dona mexe no site sozinha.
 *
 * Mexer aqui não altera nenhuma peça. A etiqueta da peça é texto solto em
 * `produtos.etiqueta`; esta tabela só guarda as sugestões que aparecem na
 * hora de preencher.
 */

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
}

/**
 * O criar devolve a linha gravada.
 *
 * A tela acrescenta a etiqueta na hora, sem esperar recarregar, e precisa do
 * id de verdade para as ações seguintes funcionarem. Inventar um id no cliente
 * fazia apagar ou renomear uma etiqueta recém-criada bater numa linha que não
 * existe.
 */
export interface ResultadoCriacao extends ResultadoAcao {
  id?: string;
  ordem?: number;
}

const LIMITE = 18;

function revalidar() {
  revalidatePath("/admin/etiquetas");
  revalidatePath("/admin/produtos");
}

function validar(texto: string): string | null {
  const limpo = texto.trim();
  if (!limpo) return "Escreva a etiqueta antes de salvar.";
  if (limpo.length > LIMITE) {
    return `A etiqueta precisa caber no canto da foto: até ${LIMITE} letras.`;
  }
  return null;
}

/** Mensagem do Postgres traduzida para quem não é técnica. */
function traduzirErro(mensagem: string): string {
  if (mensagem.includes("etiquetas_texto_key") || mensagem.includes("duplicate")) {
    return "Essa etiqueta já está na lista.";
  }
  if (mensagem.includes("etiquetas_texto_cabe")) {
    return `A etiqueta precisa caber no canto da foto: até ${LIMITE} letras.`;
  }
  return "Não foi possível salvar.";
}

export async function criarEtiqueta(texto: string): Promise<ResultadoCriacao> {
  const problema = validar(texto);
  if (problema) return { ok: false, erro: problema };

  const supabase = await createClient();

  // Entra no fim da lista. Somar 1 ao maior evita empate na ordem quando ela
  // apaga uma do meio e cria outra logo depois.
  const { data: ultima } = await supabase
    .from("etiquetas")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ordem = (ultima?.ordem ?? 0) + 1;

  const { data, error } = await supabase
    .from("etiquetas")
    .insert({ texto: texto.trim(), ordem })
    .select("id, ordem")
    .single();

  if (error) return { ok: false, erro: traduzirErro(error.message) };

  revalidar();
  return { ok: true, id: data.id, ordem: data.ordem };
}

/**
 * Renomeia uma etiqueta do catálogo.
 *
 * Não mexe nas peças que já usam o texto antigo, de propósito: renomear uma
 * sugestão não deveria reescrever o selo de trinta vestidos sem ela mandar. A
 * tela avisa isso em texto.
 */
export async function renomearEtiqueta(
  id: string,
  texto: string,
): Promise<ResultadoAcao> {
  const problema = validar(texto);
  if (problema) return { ok: false, erro: problema };

  const supabase = await createClient();
  const { error } = await supabase
    .from("etiquetas")
    .update({ texto: texto.trim() })
    .eq("id", id);

  if (error) return { ok: false, erro: traduzirErro(error.message) };

  revalidar();
  return { ok: true };
}

/**
 * Tira a etiqueta da lista de sugestões.
 *
 * As peças que já estão com esse selo continuam com ele. Some só a sugestão.
 */
export async function excluirEtiqueta(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("etiquetas").delete().eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível apagar." };

  revalidar();
  return { ok: true };
}

/** Troca a posição de duas etiquetas, para a lista sair na ordem que ela quer. */
export async function moverEtiqueta(
  id: string,
  ordem: number,
  idVizinha: string,
  ordemVizinha: number,
): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const [a, b] = await Promise.all([
    supabase.from("etiquetas").update({ ordem: ordemVizinha }).eq("id", id),
    supabase.from("etiquetas").update({ ordem }).eq("id", idVizinha),
  ]);

  if (a.error || b.error) {
    return { ok: false, erro: "Não foi possível mudar a ordem." };
  }

  revalidar();
  return { ok: true };
}
