import { createClient } from "@/lib/supabase/server";

/**
 * Números do painel, todos derivados da tabela `eventos`.
 *
 * Usa o cliente com sessão (`supabase/server`), não o público: a RLS só
 * libera leitura de `eventos` para autenticado. Se estas funções fossem pelo
 * cliente anônimo, voltariam vazias em silêncio.
 */

export interface DiaDeCliques {
  /** ISO curto, "2026-08-21". */
  dia: string;
  cliques: number;
}

export interface VestidoNoRanking {
  produtoId: string;
  nome: string;
  slug: string;
  visitas: number;
  cliques: number;
}

export interface ResumoPainel {
  produtosAtivos: number;
  cliquesWhatsapp: number;
  visitasProduto: number;
  cupomDestaque: { codigo: string; influenciadora: string | null; cliques: number } | null;
  porDia: DiaDeCliques[];
  ranking: VestidoNoRanking[];
  /** Nenhum evento no período. O painel troca os números por uma explicação. */
  vazio: boolean;
}

const DIAS = 30;

function inicioDoPeriodo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - (DIAS - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Todos os dias do período, inclusive os sem evento — senão o gráfico mente. */
function esqueletoDeDias(): Map<string, number> {
  const mapa = new Map<string, number>();
  const cursor = inicioDoPeriodo();
  for (let i = 0; i < DIAS; i += 1) {
    mapa.set(cursor.toISOString().slice(0, 10), 0);
    cursor.setDate(cursor.getDate() + 1);
  }
  return mapa;
}

export async function getResumoPainel(): Promise<ResumoPainel> {
  const supabase = await createClient();
  const desde = inicioDoPeriodo().toISOString();

  const [eventos, produtos] = await Promise.all([
    supabase
      .from("eventos")
      .select(
        "tipo, created_at, produto_id, cupom_id, produto:produtos(nome, slug), cupom:cupons(codigo, influenciadora_nome)",
      )
      .gte("created_at", desde),
    supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("ativo", true),
  ]);

  if (eventos.error) {
    throw new Error(`Falha ao ler os eventos: ${eventos.error.message}`);
  }

  const linhas = (eventos.data ?? []) as unknown as Array<{
    tipo: string;
    created_at: string;
    produto_id: string | null;
    cupom_id: string | null;
    produto: { nome: string; slug: string } | null;
    cupom: { codigo: string; influenciadora_nome: string | null } | null;
  }>;

  const porDia = esqueletoDeDias();
  const porProduto = new Map<string, VestidoNoRanking>();
  const porCupom = new Map<
    string,
    { codigo: string; influenciadora: string | null; cliques: number }
  >();

  let cliquesWhatsapp = 0;
  let visitasProduto = 0;

  for (const linha of linhas) {
    const dia = linha.created_at.slice(0, 10);

    if (linha.produto_id && linha.produto) {
      const atual = porProduto.get(linha.produto_id) ?? {
        produtoId: linha.produto_id,
        nome: linha.produto.nome,
        slug: linha.produto.slug,
        visitas: 0,
        cliques: 0,
      };
      if (linha.tipo === "visita_produto") atual.visitas += 1;
      if (linha.tipo === "clique_whatsapp") atual.cliques += 1;
      porProduto.set(linha.produto_id, atual);
    }

    if (linha.tipo === "visita_produto") {
      visitasProduto += 1;
    }

    if (linha.tipo === "clique_whatsapp") {
      cliquesWhatsapp += 1;
      if (porDia.has(dia)) porDia.set(dia, (porDia.get(dia) ?? 0) + 1);

      if (linha.cupom_id && linha.cupom) {
        const atual = porCupom.get(linha.cupom_id) ?? {
          codigo: linha.cupom.codigo,
          influenciadora: linha.cupom.influenciadora_nome,
          cliques: 0,
        };
        atual.cliques += 1;
        porCupom.set(linha.cupom_id, atual);
      }
    }
  }

  const cupomDestaque =
    [...porCupom.values()].sort((a, b) => b.cliques - a.cliques)[0] ?? null;

  const ranking = [...porProduto.values()]
    .sort((a, b) => b.visitas - a.visitas || b.cliques - a.cliques)
    .slice(0, 10);

  return {
    produtosAtivos: produtos.count ?? 0,
    cliquesWhatsapp,
    visitasProduto,
    cupomDestaque,
    porDia: [...porDia.entries()].map(([dia, cliques]) => ({ dia, cliques })),
    ranking,
    vazio: linhas.length === 0,
  };
}
