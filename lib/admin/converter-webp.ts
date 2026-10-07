import sharp from "sharp";
import { PIXELS_MAXIMOS, QUALIDADE } from "@/lib/admin/comprimir-imagem";

/**
 * Conversão para webp no servidor.
 *
 * Existe porque o navegador nem sempre consegue. O Safari, no iPhone e no
 * Mac, não gera webp, e o compressor do painel cai para JPEG. Medido no
 * bucket em 07/10/2026: de 9 a 15 de setembro, quando o acervo foi
 * fotografado e cadastrado, os 64 envios do painel saíram em JPEG. Nenhum
 * em webp.
 *
 * A receita é a mesma do navegador: teto de pixels e qualidade iguais. Uma
 * foto convertida aqui e uma convertida lá ficam indistinguíveis no site.
 *
 * Só roda no servidor: `sharp` é binário nativo.
 */
export async function converterParaWebp(
  entrada: ArrayBuffer | Uint8Array,
): Promise<Buffer> {
  // `rotate()` sem argumento endireita pela orientação gravada na foto. O
  // JPEG que vem do navegador já chega em pé; a capa de reel, nem sempre.
  const imagem = sharp(entrada).rotate();
  const { width = 0, height = 0 } = await imagem.metadata();

  if (!width || !height) {
    throw new Error("Arquivo sem dimensões: não é uma imagem que dá para ler.");
  }

  // Mesmo critério do navegador: total de pixels, não largura. O lado maior
  // vira o teto de um quadrado, o que vale com a foto em pé ou deitada, antes
  // ou depois de endireitar.
  const escala = Math.min(1, Math.sqrt(PIXELS_MAXIMOS / (width * height)));
  if (escala < 1) {
    const lado = Math.round(Math.max(width, height) * escala);
    imagem.resize({ width: lado, height: lado, fit: "inside" });
  }

  return imagem.webp({ quality: Math.round(QUALIDADE * 100) }).toBuffer();
}
