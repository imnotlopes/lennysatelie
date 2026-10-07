import { garantirWebp } from "@/app/actions/admin-imagens";
import { comprimirImagem } from "@/lib/admin/comprimir-imagem";
import { createClient } from "@/lib/supabase/client";

/**
 * Onde a foto mora no bucket. `produtos/` é o acervo; `site/` são as capas
 * de coleção e as imagens da home — separadas para não se misturarem na hora
 * de olhar o bucket.
 */
export type PastaFoto = "produtos" | "site";

export interface FotoEnviada {
  /** Caminho no bucket, o que vai gravado no banco. */
  caminho: string;
  bytesOriginais: number;
  bytesFinais: number;
}

/**
 * Envio de uma foto do painel, do arquivo escolhido até o caminho no bucket.
 *
 * Três passos:
 *   1. reduz no navegador e converte para webp (ou JPEG, no Safari);
 *   2. envia direto para o bucket;
 *   3. se saiu JPEG, pede ao servidor a versão webp e fica com ela.
 *
 * O resultado é webp em qualquer aparelho. Se o passo 3 falhar, a foto fica
 * em JPEG — salva e aparecendo no site. Não vale incomodar a dona com isso:
 * `scripts/converter-para-webp.mjs` encontra e converte essas depois.
 *
 * Lança com mensagem pronta para a tela quando a foto não pôde ser enviada.
 */
export async function enviarFoto(
  arquivo: File,
  pasta: PastaFoto,
  aoComprimir?: () => void,
): Promise<FotoEnviada> {
  const comprimida = await comprimirImagem(arquivo);
  aoComprimir?.();

  // Extensão e tipo do que foi REALMENTE gerado. Já foram fixos em webp, e
  // quando a compressão caía para outro formato subia um PNG chamado `.webp`,
  // servido como `image/webp`. Achado na auditoria.
  const caminho = `${pasta}/${crypto.randomUUID()}.${comprimida.formato}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("produtos")
    .upload(caminho, comprimida.arquivo, {
      contentType: `image/${comprimida.formato}`,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível enviar "${arquivo.name}". Confira a internet e tente de novo.`,
    );
  }

  const enviada: FotoEnviada = {
    caminho,
    bytesOriginais: comprimida.bytesOriginais,
    bytesFinais: comprimida.bytesFinais,
  };

  if (comprimida.formato === "webp") return enviada;

  const convertida = await garantirWebp(caminho).catch(() => null);
  if (!convertida?.ok || !convertida.caminho) {
    console.warn(
      `Foto ficou em JPEG (${caminho}):`,
      convertida?.erro ?? "sem resposta do servidor",
    );
    return enviada;
  }

  return {
    ...enviada,
    caminho: convertida.caminho,
    bytesFinais: convertida.bytes ?? enviada.bytesFinais,
  };
}
