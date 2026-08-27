import { cookies } from "next/headers";
import { COOKIE_CUPOM, cupomEhValido } from "@/lib/cupom";
import { getCupomByCodigo } from "./cupons";
import type { CupomPublico } from "@/lib/supabase/types";

/**
 * Cupom ativo da visitante, lido do cookie gravado pelo middleware.
 *
 * Revalida contra o banco a cada requisição em vez de confiar no cookie: um
 * cupom desativado ou esgotado depois da captura precisa parar de valer na
 * hora, e o cookie sozinho não sabe disso.
 *
 * Nunca lança. Sem cupom, sem cookie ou com falha de banco, devolve `null` e
 * o site mostra os preços cheios.
 *
 * Atenção: usa `cookies()`, que é API dinâmica. Toda rota que chamar esta
 * função deixa de ser gerada estaticamente.
 */
export async function getCupomAtivo(): Promise<CupomPublico | null> {
  try {
    const jar = await cookies();
    const codigo = jar.get(COOKIE_CUPOM)?.value;
    if (!codigo) return null;

    const cupom = await getCupomByCodigo(codigo);
    if (!cupom || !cupomEhValido(cupom)) return null;

    return cupom;
  } catch {
    return null;
  }
}
