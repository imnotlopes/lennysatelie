"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TipoMidia } from "@/lib/supabase/types";
import type { ResultadoAcao } from "./admin-produtos";

export interface DadosMidia {
  tipo: TipoMidia;
  arquivo: string;
  textoAlt: string;
  url: string;
  ativo: boolean;
}

/**
 * O texto alternativo é exigido nas duas seções de depoimento porque nelas o
 * texto está DENTRO da imagem. Sem ele, quem usa leitor de tela encontra um
 * bloco mudo e a busca não indexa nada.
 *
 * No hero e nos reels não se exige: a foto do topo é decorativa e o reel já é
 * descrito pelo título da seção.
 */
const EXIGE_TEXTO: TipoMidia[] = ["feedback_imagem", "feedback_mensagem"];

function validar(dados: DadosMidia): string | null {
  if (!dados.arquivo.trim()) return "Escolha uma imagem.";

  if (EXIGE_TEXTO.includes(dados.tipo) && dados.textoAlt.trim().length < 10) {
    return "Escreva o que está escrito na imagem. É o que quem não enxerga vai ler.";
  }

  if (dados.tipo === "reel") {
    const url = dados.url.trim();
    if (!url) return "Cole o link do vídeo no Instagram.";
    if (!/^https:\/\/(www\.)?instagram\.com\//.test(url)) {
      return "O link precisa ser do Instagram, começando com https://www.instagram.com/";
    }
  }
  return null;
}

/** Revalida a home e o cache das mídias de uma vez só. */
function revalidar() {
  updateTag("midias");
  revalidatePath("/", "layout");
  revalidatePath("/admin/imagens");
}

/**
 * Baixa a capa de um reel a partir do link e guarda no bucket.
 *
 * O Instagram publica a miniatura na meta tag `og:image` sem exigir login, e
 * a dona só precisa colar o endereço do vídeo — não tem que achar, recortar
 * nem enviar imagem nenhuma.
 *
 * O arquivo é BAIXADO, não referenciado. A URL que o Instagram devolve é
 * assinada e para de funcionar em poucos dias: apontar para ela deixaria a
 * seção com quadros quebrados na semana seguinte. Tentei, e o Next nem aceitou
 * o domínio — o que, no fim, foi um erro útil.
 */
export async function buscarCapaDoReel(
  url: string,
): Promise<{ ok: boolean; capa?: string; erro?: string }> {
  const limpo = url.trim();
  if (!/^https:\/\/(www\.)?instagram\.com\//.test(limpo)) {
    return { ok: false, erro: "O link precisa ser do Instagram." };
  }

  try {
    const pagina = await fetch(limpo, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LennysAtelie/1.0)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!pagina.ok) {
      return { ok: false, erro: "O Instagram não respondeu. Tente de novo." };
    }

    const html = await pagina.text();
    const achado = html.match(/property="og:image" content="([^"]+)"/);
    if (!achado) {
      return {
        ok: false,
        erro: "Não achamos a imagem desse vídeo. Confira se a publicação é pública.",
      };
    }

    const endereco = achado[1].replaceAll("&amp;", "&");
    const imagem = await fetch(endereco, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!imagem.ok) {
      return { ok: false, erro: "Não conseguimos baixar a capa do vídeo." };
    }

    const bytes = new Uint8Array(await imagem.arrayBuffer());
    const tipo = imagem.headers.get("content-type") ?? "image/jpeg";
    const extensao = tipo.includes("png")
      ? "png"
      : tipo.includes("webp")
        ? "webp"
        : "jpg";
    const caminho = `site/reel-${crypto.randomUUID()}.${extensao}`;

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("produtos")
      .upload(caminho, bytes, { contentType: tipo, upsert: false });

    if (error) {
      return { ok: false, erro: "Não foi possível guardar a capa." };
    }

    return { ok: true, capa: caminho };
  } catch {
    return { ok: false, erro: "Não conseguimos falar com o Instagram agora." };
  }
}

export async function criarMidia(dados: DadosMidia): Promise<ResultadoAcao> {
  const erro = validar(dados);
  if (erro) return { ok: false, erro };

  const supabase = await createClient();

  // Entra no fim da fila da própria seção.
  const { data: ultima } = await supabase
    .from("midias")
    .select("ordem")
    .eq("tipo", dados.tipo)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("midias")
    .insert({
      tipo: dados.tipo,
      arquivo: dados.arquivo.trim(),
      texto_alt: dados.textoAlt.trim() || null,
      url: dados.url.trim() || null,
      ordem: (ultima?.ordem ?? 0) + 1,
      ativo: dados.ativo,
    })
    .select("id")
    .single();

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true, id: data.id };
}

export async function atualizarMidia(
  id: string,
  dados: DadosMidia,
): Promise<ResultadoAcao> {
  const erro = validar(dados);
  if (erro) return { ok: false, erro };

  const supabase = await createClient();
  const { error } = await supabase
    .from("midias")
    .update({
      arquivo: dados.arquivo.trim(),
      texto_alt: dados.textoAlt.trim() || null,
      url: dados.url.trim() || null,
      ativo: dados.ativo,
    })
    .eq("id", id);

  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true, id };
}

/**
 * Liga e desliga sem apagar.
 *
 * É o caminho seguro para tirar algo do ar: a imagem some do site, continua no
 * painel, e volta com um clique. Apagar não tem volta.
 */
export async function alternarMidiaAtiva(
  id: string,
  ativo: boolean,
): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("midias").update({ ativo }).eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível salvar." };

  revalidar();
  return { ok: true };
}

/** Troca a posição de duas mídias da mesma seção. */
export async function moverMidia(
  id: string,
  direcao: "sobe" | "desce",
): Promise<ResultadoAcao> {
  const supabase = await createClient();

  const { data: atual } = await supabase
    .from("midias")
    .select("id, tipo, ordem")
    .eq("id", id)
    .maybeSingle();

  if (!atual) return { ok: false, erro: "Imagem não encontrada." };

  const { data: vizinha } = await supabase
    .from("midias")
    .select("id, ordem")
    .eq("tipo", atual.tipo)
    .filter("ordem", direcao === "sobe" ? "lt" : "gt", atual.ordem)
    .order("ordem", { ascending: direcao !== "sobe" })
    .limit(1)
    .maybeSingle();

  // Já está na ponta: nada a fazer, e isso não é erro.
  if (!vizinha) return { ok: true };

  await supabase.from("midias").update({ ordem: vizinha.ordem }).eq("id", atual.id);
  await supabase.from("midias").update({ ordem: atual.ordem }).eq("id", vizinha.id);

  revalidar();
  return { ok: true };
}

export async function excluirMidia(id: string): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const { error } = await supabase.from("midias").delete().eq("id", id);
  if (error) return { ok: false, erro: "Não foi possível excluir." };

  revalidar();
  return { ok: true };
}
