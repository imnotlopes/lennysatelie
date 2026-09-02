import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Etiqueta } from "@/lib/supabase/types";

const CAMPOS = "id, texto, ordem, created_at";

/** Etiqueta do catálogo com quantas peças estão usando aquele texto hoje. */
export type EtiquetaComUso = Etiqueta & { usos: number };

/**
 * O catálogo de etiquetas, na ordem que a dona definiu.
 *
 * Sem cache: é lista curta, só o painel lê, e ela precisa ver o efeito do que
 * acabou de salvar. Cachear aqui só criaria a chance de ela renomear uma
 * etiqueta e continuar vendo a antiga.
 *
 * Nunca lança: se a leitura falhar, o formulário de produto fica sem
 * sugestões, mas o campo continua aceitando texto livre. Melhor uma lista
 * vazia que uma tela de erro no meio do cadastro de uma peça.
 */
export async function getEtiquetas(): Promise<Etiqueta[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("etiquetas")
      .select(CAMPOS)
      .order("ordem", { ascending: true })
      .order("texto", { ascending: true });

    if (error) {
      console.error("Falha ao ler as etiquetas:", error.message);
      return [];
    }
    return (data ?? []) as Etiqueta[];
  } catch (erro) {
    // O Next sinaliza coisas por exceção — renderização dinâmica, redirect,
    // notFound. Engolir essas quebraria o framework e ainda enchia o log do
    // build de "Falha ao ler as etiquetas" que não era falha nenhuma.
    unstable_rethrow(erro);
    console.error("Falha ao ler as etiquetas:", erro);
    return [];
  }
}

/**
 * O catálogo com a contagem de uso de cada etiqueta.
 *
 * A contagem existe para ela saber o que está prestes a perder antes de apagar
 * uma sugestão. Apagar do catálogo não tira o selo das peças, mas some com a
 * sugestão, e sem o número a tela não deixaria isso claro.
 *
 * A soma é feita aqui e não no banco porque `produtos.etiqueta` é texto solto:
 * são algumas centenas de linhas de uma coluna só, e contar em memória evita
 * uma função no Postgres para um número que a tela mostra em cinza.
 */
export async function getEtiquetasComUso(): Promise<EtiquetaComUso[]> {
  const supabase = await createClient();

  const [catalogo, emUso] = await Promise.all([
    getEtiquetas(),
    supabase.from("produtos").select("etiqueta").not("etiqueta", "is", null),
  ]);

  const contagem = new Map<string, number>();
  for (const linha of emUso.data ?? []) {
    const texto = linha.etiqueta?.trim();
    if (!texto) continue;
    contagem.set(texto, (contagem.get(texto) ?? 0) + 1);
  }

  return catalogo.map((e) => ({ ...e, usos: contagem.get(e.texto) ?? 0 }));
}
