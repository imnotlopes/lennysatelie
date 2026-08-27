import { createPublicClient } from "@/lib/supabase/public";
import type { TipoEvento } from "@/lib/supabase/types";

/**
 * Registra um evento de uso do site.
 *
 * É o que transforma o cupom de influenciadora em métrica de campanha em vez
 * de código solto: dá para cruzar visita de produto, cupom aplicado e clique
 * no WhatsApp.
 *
 * Não lança erro. Telemetria não pode derrubar a página que a cliente está
 * vendo — se falhar, registra no log do servidor e segue.
 */
export async function registrarEvento(
  tipo: TipoEvento,
  produtoId?: string,
  cupomId?: string,
): Promise<void> {
  try {
    const supabase = createPublicClient();

    const { error } = await supabase.from("eventos").insert({
      tipo,
      produto_id: produtoId ?? null,
      cupom_id: cupomId ?? null,
    });

    if (error) {
      console.error(`Falha ao registrar evento "${tipo}":`, error.message);
    }
  } catch (erro) {
    console.error(`Falha ao registrar evento "${tipo}":`, erro);
  }
}
