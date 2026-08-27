"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ResultadoAcao } from "./admin-produtos";

export interface DadosCupom {
  codigo: string;
  influenciadoraNome: string;
  influenciadoraInstagram: string;
  tipoDesconto: "percentual" | "fixo";
  valor: number;
  inicio: string | null;
  validade: string | null;
  limiteUsos: number | null;
  ativo: boolean;
}

/**
 * Escrita de cupons pelo painel.
 *
 * O código é sempre gravado em maiúsculas: o middleware normaliza antes de
 * comparar, então um cupom salvo em minúsculas nunca casaria.
 */

function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase().replace(/\s+/g, "");
}

function validar(dados: DadosCupom): string | null {
  if (normalizarCodigo(dados.codigo).length < 3) {
    return "O código precisa ter pelo menos 3 letras ou números.";
  }
  if (!/^[A-Z0-9]+$/.test(normalizarCodigo(dados.codigo))) {
    return "Use só letras e números no código. Sem espaço, acento ou símbolo.";
  }
  if (dados.valor <= 0) {
    return "Informe o valor do desconto.";
  }
  if (dados.tipoDesconto === "percentual" && dados.valor > 100) {
    return "Um desconto em porcentagem não pode passar de 100%.";
  }
  // O banco tem a mesma trava, mas a mensagem dele é impossível de entender.
  if (dados.inicio && dados.validade && dados.inicio > dados.validade) {
    return "O cupom não pode começar depois do dia em que ele vence.";
  }
  return null;
}

function paraBanco(dados: DadosCupom) {
  return {
    codigo: normalizarCodigo(dados.codigo),
    influenciadora_nome: dados.influenciadoraNome.trim() || null,
    influenciadora_instagram: dados.influenciadoraInstagram.trim() || null,
    tipo_desconto: dados.tipoDesconto,
    valor: dados.valor,
    inicio: dados.inicio || null,
    validade: dados.validade || null,
    limite_usos: dados.limiteUsos,
    ativo: dados.ativo,
  };
}

/** Checa duplicidade antes de gravar, para dar mensagem melhor que a do banco. */
async function codigoJaExiste(codigo: string, ignorarId?: string) {
  const supabase = await createClient();
  let query = supabase.from("cupons").select("id").eq("codigo", codigo);
  if (ignorarId) query = query.neq("id", ignorarId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

export async function criarCupom(dados: DadosCupom): Promise<ResultadoAcao> {
  const erro = validar(dados);
  if (erro) return { ok: false, erro };

  const codigo = normalizarCodigo(dados.codigo);
  if (await codigoJaExiste(codigo)) {
    return { ok: false, erro: `O código ${codigo} já está em uso por outro cupom.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cupons")
    .insert(paraBanco(dados))
    .select("id")
    .single();

  if (error) return { ok: false, erro: "Não foi possível salvar o cupom." };

  revalidatePath("/admin/cupons");
  return { ok: true, id: data.id };
}

export async function atualizarCupom(
  id: string,
  dados: DadosCupom,
): Promise<ResultadoAcao> {
  const erro = validar(dados);
  if (erro) return { ok: false, erro };

  const codigo = normalizarCodigo(dados.codigo);
  if (await codigoJaExiste(codigo, id)) {
    return { ok: false, erro: `O código ${codigo} já está em uso por outro cupom.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cupons").update(paraBanco(dados)).eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar o cupom." };

  revalidatePath("/admin/cupons");
  return { ok: true, id };
}

/**
 * Contador de aluguéis confirmados, editado à mão.
 *
 * Não sobe sozinho no clique do WhatsApp: clicar não é alugar. Quem sabe se o
 * aluguel aconteceu é a dona, e é ela quem marca aqui.
 */
export async function atualizarUsos(
  id: string,
  usos: number,
): Promise<ResultadoAcao> {
  if (!Number.isInteger(usos) || usos < 0) {
    return { ok: false, erro: "Informe um número inteiro de usos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cupons").update({ usos }).eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidatePath("/admin/cupons");
  return { ok: true };
}

export async function alternarCupomAtivo(
  id: string,
  ativo: boolean,
): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("cupons").update({ ativo }).eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidatePath("/admin/cupons");
  return { ok: true };
}

export async function excluirCupom(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("cupons").delete().eq("id", id);

  if (error) {
    return {
      ok: false,
      erro: "Não foi possível excluir. Se o cupom já teve uso, desative em vez de apagar.",
    };
  }

  revalidatePath("/admin/cupons");
  return { ok: true };
}
