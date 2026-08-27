import { createPublicClient } from "@/lib/supabase/public";
import type { CupomPublico } from "@/lib/supabase/types";

const CAMPOS_PUBLICOS =
  "id, codigo, influenciadora_nome, tipo_desconto, valor, ativo, validade, limite_usos, usos";

/**
 * Busca um cupom pelo código digitado pela cliente.
 *
 * Devolve `null` quando o código não existe, está inativo, venceu ou estourou
 * o limite de usos — a RLS já derruba esses casos, então do lado de cá basta
 * tratar a ausência. Quem chama não consegue distinguir "não existe" de
 * "expirou", o que é proposital: não vale dar pista para quem fica testando
 * códigos.
 *
 * O Instagram da influenciadora não vem por aqui: o GRANT na migration deixa
 * essa coluna fora do alcance do papel `anon`.
 */
export async function getCupomByCodigo(
  codigo: string,
): Promise<CupomPublico | null> {
  const limpo = codigo.trim().toUpperCase();
  if (!limpo) return null;

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("cupons")
    .select(CAMPOS_PUBLICOS)
    .eq("codigo", limpo)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao validar o cupom: ${error.message}`);
  }
  return (data as CupomPublico | null) ?? null;
}
