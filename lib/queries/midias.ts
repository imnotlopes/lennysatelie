import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Midia, TipoMidia } from "@/lib/supabase/types";

const CAMPOS = "id, tipo, arquivo, texto_alt, url, ordem, ativo, created_at";

/** A consulta crua. Envolvida pelo cache logo abaixo. */
async function lerMidias(tipo: TipoMidia): Promise<Midia[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("midias")
      .select(CAMPOS)
      .eq("tipo", tipo)
      .eq("ativo", true)
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(`Falha ao ler mídias (${tipo}):`, error.message);
      return [];
    }
    return (data ?? []) as Midia[];
  } catch (erro) {
    console.error(`Falha ao ler mídias (${tipo}):`, erro);
    return [];
  }
}

/**
 * Mídias de uma seção do site, só as ligadas, na ordem que a dona definiu.
 *
 * Nunca lança: se o banco cair, a seção fica vazia e some sozinha em vez de
 * derrubar a home inteira.
 *
 * Em cache pela tag `midias`, invalidada quando ela salva no painel. Sem isso
 * a home iria ao banco quatro vezes por carregamento — uma por seção.
 */
export const getMidias = unstable_cache(lerMidias, ["midias"], {
  revalidate: 3600,
  tags: ["midias"],
});

/**
 * Tudo, inclusive o que está desligado. Só para o painel.
 *
 * Sem cache de propósito: a dona precisa ver o efeito do que acabou de salvar,
 * e aqui não há volume que justifique guardar.
 */
export async function getTodasMidias(): Promise<Midia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("midias")
    .select(CAMPOS)
    .order("tipo", { ascending: true })
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Falha ao carregar as mídias: ${error.message}`);
  return (data ?? []) as Midia[];
}
