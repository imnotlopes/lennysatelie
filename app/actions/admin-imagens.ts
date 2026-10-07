"use server";

import { converterParaWebp } from "@/lib/admin/converter-webp";
import { createClient } from "@/lib/supabase/server";

export interface ResultadoWebp {
  ok: boolean;
  /** Caminho novo, já em webp. */
  caminho?: string;
  /** Tamanho final, para o aviso de quanto a foto diminuiu. */
  bytes?: number;
  erro?: string;
}

/**
 * Só o que o próprio painel envia: pasta conhecida, nome gerado por nós, e
 * formato que ainda não é webp. Qualquer outra coisa é recusada antes de
 * tocar no bucket — esta ação apaga o arquivo original no fim.
 */
const CONVERTIVEL = /^(produtos|site)\/[a-z0-9-]+\.(jpe?g|png)$/;

/**
 * Troca uma foto recém-enviada pela versão webp dela.
 *
 * O navegador envia direto para o bucket, como sempre fez. Quando ele não
 * consegue gerar webp — o Safari, no iPhone e no Mac — a foto sobe em JPEG
 * e o painel chama esta ação logo em seguida: o servidor baixa, converte,
 * grava o `.webp` ao lado e apaga o JPEG.
 *
 * Feito depois do envio, e não no lugar dele, por dois motivos. Mandar a
 * foto pelo servidor esbarraria no limite de 1 MB das ações. E, se a
 * conversão falhar, a foto já está salva em JPEG e continua aparecendo no
 * site — perde-se o formato, não a foto.
 */
export async function garantirWebp(caminho: string): Promise<ResultadoWebp> {
  if (!CONVERTIVEL.test(caminho)) {
    return { ok: false, erro: "Essa imagem não pode ser convertida." };
  }

  const supabase = await createClient();

  // A leitura do bucket é pública; sem esta conferência, qualquer um poderia
  // fazer o servidor baixar e converter fotos. A escrita já é barrada pela
  // RLS, mas o trabalho pesado vem antes dela.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, erro: "Sua sessão terminou. Entre de novo no painel." };
  }

  const bucket = supabase.storage.from("produtos");

  const { data: original, error: erroDownload } =
    await bucket.download(caminho);
  if (erroDownload || !original) {
    return { ok: false, erro: "Não encontramos a foto enviada." };
  }

  let webp: Buffer;
  try {
    webp = await converterParaWebp(await original.arrayBuffer());
  } catch (erro) {
    console.error(`Falha ao converter ${caminho} para webp:`, erro);
    return { ok: false, erro: "Não conseguimos converter essa foto." };
  }

  const novo = caminho.replace(/\.[^.]+$/, ".webp");
  const { error: erroUpload } = await bucket.upload(novo, webp, {
    contentType: "image/webp",
    upsert: false,
  });
  if (erroUpload) {
    return { ok: false, erro: "Não conseguimos guardar a foto convertida." };
  }

  // O original sai por último, e só depois que o webp está salvo. Falha
  // aqui deixa um JPEG órfão no bucket, que não aparece em lugar nenhum —
  // não vale derrubar o envio por isso.
  const { error: erroRemove } = await bucket.remove([caminho]);
  if (erroRemove) {
    console.error(`Falha ao apagar ${caminho} depois de converter:`, erroRemove.message);
  }

  return { ok: true, caminho: novo, bytes: webp.length };
}
