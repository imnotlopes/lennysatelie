import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Depoimento, Link } from "@/lib/supabase/types";

/**
 * O que a página de links lê.
 *
 * As duas consultas pedem só as linhas ativas e já ordenadas: a página não
 * filtra nem ordena nada, só desenha o que chega.
 *
 * Banco fora do ar não derruba a página. Ela é o link da bio — se aparecer
 * erro, a pessoa que veio do Instagram simplesmente vai embora. Sem links a
 * página ainda mostra a marca e a chamada; sem depoimentos a seção some.
 */
async function lerLinks(): Promise<Link[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Falha ao ler os links:", error.message);
      return [];
    }
    return data ?? [];
  } catch (erro) {
    console.error("Falha ao ler os links:", erro);
    return [];
  }
}

async function lerDepoimentos(): Promise<Depoimento[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("depoimentos")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Falha ao ler os depoimentos:", error.message);
      return [];
    }
    return data ?? [];
  } catch (erro) {
    console.error("Falha ao ler os depoimentos:", erro);
    return [];
  }
}

export const getLinks = unstable_cache(lerLinks, ["links"], {
  tags: ["links"],
  revalidate: 300,
});

export const getDepoimentos = unstable_cache(lerDepoimentos, ["depoimentos"], {
  tags: ["depoimentos"],
  revalidate: 300,
});

/** Um link com quantos cliques ele levou nos últimos 30 dias. */
export interface LinkComCliques extends Link {
  cliques: number;
}

/**
 * Tudo o que o painel precisa: os links, ativos e desligados, com a contagem.
 *
 * Sem cache, ao contrário das consultas da página: aqui a dona acabou de
 * salvar e precisa ver o que gravou. Cache no painel é como o salvamento
 * parece ter falhado.
 *
 * A contagem é feita aqui e não no banco porque são seis linhas e uma tabela
 * de eventos pequena — uma função agregada no Postgres seria mais peça para
 * manter do que trabalho poupado. Se a lista crescer muito, vira uma view.
 */
export async function getLinksDoPainel(): Promise<LinkComCliques[]> {
  const supabase = await createClient();

  const trintaDias = new Date();
  trintaDias.setDate(trintaDias.getDate() - 30);

  const [{ data: links, error }, { data: eventos }] = await Promise.all([
    supabase.from("links").select("*").order("ordem", { ascending: true }),
    supabase
      .from("eventos")
      .select("link_id")
      .eq("tipo", "clique_link")
      .gte("created_at", trintaDias.toISOString()),
  ]);

  if (error) {
    throw new Error(`Falha ao ler os links: ${error.message}`);
  }

  const contagem = new Map<string, number>();
  for (const evento of eventos ?? []) {
    if (!evento.link_id) continue;
    contagem.set(evento.link_id, (contagem.get(evento.link_id) ?? 0) + 1);
  }

  return (links ?? []).map((link) => ({
    ...link,
    cliques: contagem.get(link.id) ?? 0,
  }));
}
