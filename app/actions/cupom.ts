"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_CUPOM, CUPOM_MAX_AGE, cupomEhValido } from "@/lib/cupom";
import { getCupomByCodigo, registrarEvento } from "@/lib/queries";

/** Apaga o cookie do cupom e recarrega a árvore para os preços voltarem ao cheio. */
export async function removerCupom() {
  const jar = await cookies();
  jar.delete(COOKIE_CUPOM);
  revalidatePath("/", "layout");
}

/**
 * Registra que o cupom foi aplicado. Chamado uma vez por sessão pelo banner.
 *
 * `produto_id` fica nulo de propósito: o cupom é aplicado no site inteiro, não
 * numa peça.
 */
export async function registrarCupomAplicado(cupomId: string) {
  await registrarEvento("cupom_aplicado", undefined, cupomId);
}

export interface ResultadoCupom {
  ok: boolean;
  /** Mensagem para a cliente. Só existe quando algo deu errado. */
  erro?: string;
}

/**
 * Aplica um cupom digitado pela cliente.
 *
 * Existe porque o link nem sempre chega inteiro: no story do Instagram a
 * influenciadora costuma só falar o código. Sem este caminho, essa cliente vê
 * preço cheio, o desconto vira uma negociação no WhatsApp e a campanha some
 * da métrica.
 *
 * O erro é o mesmo para código inexistente, vencido, esgotado ou desligado,
 * de propósito: quem fica testando código no escuro não ganha pista nenhuma,
 * e para a cliente de verdade a diferença não muda o que ela faz agora.
 */
export async function aplicarCupom(codigo: string): Promise<ResultadoCupom> {
  const limpo = codigo.trim().toUpperCase();

  if (limpo.length < 3) {
    return { ok: false, erro: "Digite o código completo." };
  }

  let cupom;
  try {
    cupom = await getCupomByCodigo(limpo);
  } catch {
    // Banco fora do ar não é culpa de quem digitou.
    return {
      ok: false,
      erro: "Não conseguimos verificar agora. Tente de novo em instantes.",
    };
  }

  if (!cupom || !cupomEhValido(cupom)) {
    return {
      ok: false,
      erro: "Esse código não está valendo. Confira se digitou certo.",
    };
  }

  const jar = await cookies();
  jar.set(COOKIE_CUPOM, cupom.codigo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CUPOM_MAX_AGE,
    path: "/",
  });

  // O site inteiro muda de preço, não só esta página.
  revalidatePath("/", "layout");
  return { ok: true };
}
