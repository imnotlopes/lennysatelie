import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Categoria } from "@/lib/supabase/types";

/** A consulta crua. Envolvida pelo cache logo abaixo. */
async function lerCategorias(): Promise<Categoria[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar categorias: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Categorias na ordem definida no painel. Alimenta a navegação e os filtros.
 *
 * O CACHE AQUI NÃO É OTIMIZAÇÃO, É O QUE FAZ O BUILD TERMINAR
 * -----------------------------------------------------------
 * Esta consulta é chamada no layout do site, ou seja, em TODA página. Sem
 * cache, gerar as 266 páginas do build significava 266 consultas idênticas ao
 * Supabase, em sequência, numa máquina de dois núcleos. O deploy quebrou com
 * `Gateway Timeout` no meio da lista de vestidos.
 *
 * Com a etiqueta, o build consulta uma vez. O `getConfiguracoes`, que fica na
 * linha de baixo do mesmo layout, já era assim — esta aqui tinha passado
 * despercebida.
 *
 * Quem derruba a etiqueta é o painel, ao salvar uma coleção. Sem isso a Lennys
 * trocaria a capa e o site continuaria com a antiga por até uma hora.
 */
export const getCategorias = unstable_cache(lerCategorias, ["categorias"], {
  revalidate: 3600,
  tags: ["categorias"],
});

/** Busca uma categoria pelo slug. Devolve `null` quando não existe. */
export async function getCategoriaBySlug(
  slug: string,
): Promise<Categoria | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao buscar a categoria "${slug}": ${error.message}`);
  }
  return data ?? null;
}
