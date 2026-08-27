import { createPublicClient } from "@/lib/supabase/public";
import type { Categoria } from "@/lib/supabase/types";

/** Categorias na ordem definida no painel. Alimenta a navegação e os filtros. */
export async function getCategorias(): Promise<Categoria[]> {
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
