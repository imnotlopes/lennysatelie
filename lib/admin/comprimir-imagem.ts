/**
 * Compressão de foto no navegador, antes do envio.
 *
 * Foto de celular vem com 4 a 8 MB. Enviar isso cru gastaria a franquia de
 * Storage, deixaria o cadastro lento no 4G do ateliê e depois obrigaria o
 * `next/image` a processar um arquivo gigante. Comprimir aqui resolve os três
 * de uma vez.
 *
 * 1600px de largura máxima e qualidade 82 em webp: a foto ainda dá zoom na
 * página de produto e o arquivo cai para algumas centenas de kB.
 */

export const LARGURA_MAXIMA = 1600;
export const QUALIDADE = 0.82;

export interface FotoComprimida {
  arquivo: File;
  /** Para mostrar no preview sem subir nada. Lembre de revogar depois. */
  previewUrl: string;
  bytesOriginais: number;
  bytesFinais: number;
}

function carregarImagem(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não conseguimos abrir esse arquivo como imagem."));
    };
    img.src = url;
  });
}

/**
 * Converte para webp, reduzindo a largura quando passar do limite.
 *
 * Se o navegador não souber gerar webp, devolve o arquivo original em vez de
 * falhar: melhor uma foto pesada no ar do que um cadastro travado.
 */
export async function comprimirImagem(arquivo: File): Promise<FotoComprimida> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error(`"${arquivo.name}" não é uma imagem.`);
  }

  const img = await carregarImagem(arquivo);

  const escala = Math.min(1, LARGURA_MAXIMA / img.naturalWidth);
  const largura = Math.round(img.naturalWidth * escala);
  const altura = Math.round(img.naturalHeight * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      arquivo,
      previewUrl: URL.createObjectURL(arquivo),
      bytesOriginais: arquivo.size,
      bytesFinais: arquivo.size,
    };
  }

  ctx.drawImage(img, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALIDADE),
  );

  if (!blob) {
    return {
      arquivo,
      previewUrl: URL.createObjectURL(arquivo),
      bytesOriginais: arquivo.size,
      bytesFinais: arquivo.size,
    };
  }

  const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".webp";
  const comprimido = new File([blob], nome, { type: "image/webp" });

  return {
    arquivo: comprimido,
    previewUrl: URL.createObjectURL(comprimido),
    bytesOriginais: arquivo.size,
    bytesFinais: comprimido.size,
  };
}

/** "2,4 MB" — para mostrar o quanto a compressão economizou. */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
