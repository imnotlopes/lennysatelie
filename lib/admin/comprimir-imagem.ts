/**
 * Compressão de foto no navegador, antes do envio.
 *
 * Foto de celular vem com 4 a 8 MB. Enviar isso cru gastaria a franquia de
 * Storage, deixaria o cadastro lento no 4G do ateliê e depois obrigaria o
 * `next/image` a processar um arquivo gigante. Comprimir aqui resolve os três
 * de uma vez.
 *
 * O QUE DEU ERRADO ANTES
 * ----------------------
 * A versão anterior media só a LARGURA e, quando o navegador não sabia gerar
 * webp, devolvia o arquivo ORIGINAL. Quem envia dessa forma é o iPhone: o
 * Safari devolve `null` no `toBlob` com webp. O resultado foi um PNG de 3,8 MB
 * subindo com nome `.webp` e `Content-Type: image/webp`, e indo parar no hero
 * da home. Encontrado na auditoria, não suposto: baixei os arquivos e li o
 * formato real de cada um.
 *
 * Por isso agora:
 *   - o limite é de PIXELS, não de largura. Uma foto de 1170x2080 passava no
 *     teste de largura e continuava com 2,4 milhões de pixels;
 *   - quando webp falha, cai para JPEG, que todo navegador sabe gerar — e não
 *     para o arquivo original;
 *   - quem decide a extensão e o tipo é o que foi REALMENTE gerado.
 */

/** Teto de pixels: cabe uma foto 9:16 com 1600 de altura, com folga. */
export const PIXELS_MAXIMOS = 1600 * 1600;
export const QUALIDADE = 0.82;

/** Acima disto o envio é recusado, com explicação. */
export const BYTES_MAXIMOS = 25 * 1024 * 1024;

export interface FotoComprimida {
  arquivo: File;
  /** Para mostrar no preview sem subir nada. Lembre de revogar depois. */
  previewUrl: string;
  bytesOriginais: number;
  bytesFinais: number;
  /** "webp" ou "jpeg" — é o que o envio usa para nomear e declarar o tipo. */
  formato: "webp" | "jpeg";
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

/** Tenta um formato; devolve `null` quando o navegador não sabe gerá-lo. */
function tentarFormato(
  canvas: HTMLCanvasElement,
  tipo: string,
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b && b.type === tipo ? b : null),
      tipo,
      QUALIDADE,
    ),
  );
}

/**
 * Reduz a foto e converte para webp, ou JPEG onde webp não existir.
 *
 * Só lança quando não dá para seguir: arquivo que não é imagem, imagem que o
 * navegador não abre, ou nenhum dos dois formatos disponível. Nesses casos a
 * tela mostra a mensagem — é melhor que subir um arquivo mentindo o formato.
 */
export async function comprimirImagem(arquivo: File): Promise<FotoComprimida> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error(`"${arquivo.name}" não é uma imagem.`);
  }
  if (arquivo.size > BYTES_MAXIMOS) {
    throw new Error(
      `Essa foto tem ${tamanhoLegivel(arquivo.size)}. O limite é ${tamanhoLegivel(BYTES_MAXIMOS)} — tente uma foto menor.`,
    );
  }

  const img = await carregarImagem(arquivo);

  // Escala pelo total de pixels, e não pela largura: foto de celular em pé
  // passava no teste de largura e continuava enorme.
  const pixels = img.naturalWidth * img.naturalHeight;
  const escala = Math.min(1, Math.sqrt(PIXELS_MAXIMOS / pixels));
  const largura = Math.max(1, Math.round(img.naturalWidth * escala));
  const altura = Math.max(1, Math.round(img.naturalHeight * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não conseguimos preparar essa foto. Tente outra.");
  }

  ctx.drawImage(img, 0, 0, largura, altura);

  let formato: "webp" | "jpeg" = "webp";
  let blob = await tentarFormato(canvas, "image/webp");

  if (!blob) {
    // Caminho do iPhone antigo: Safari não gera webp. JPEG todo navegador
    // gera, e um JPEG honesto é melhor que um PNG fingindo ser webp.
    formato = "jpeg";
    blob = await tentarFormato(canvas, "image/jpeg");
  }

  if (!blob) {
    throw new Error(
      "Seu navegador não conseguiu preparar essa foto. Tente por outro aparelho.",
    );
  }

  const nome = arquivo.name.replace(/\.[^.]+$/, "") + "." + formato;
  const comprimido = new File([blob], nome, { type: blob.type });

  return {
    arquivo: comprimido,
    previewUrl: URL.createObjectURL(comprimido),
    bytesOriginais: arquivo.size,
    bytesFinais: comprimido.size,
    formato,
  };
}

/** "2,4 MB" — para mostrar o quanto a compressão economizou. */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
