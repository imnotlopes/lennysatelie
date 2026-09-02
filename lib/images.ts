/**
 * Resolução das imagens de produto e categoria.
 *
 * Os caminhos gravados no banco (`produtos/thistle-01.webp`) apontam para o
 * bucket `produtos` no Storage. Enquanto o acervo real não sobe, tudo cai nos
 * placeholders de /public/placeholders.
 */

/**
 * As fotos reais estão no bucket desde a carga da coleção Casamento no civil.
 *
 * Peça sem caminho gravado continua caindo no placeholder, então as 21 peças
 * de Festa, que ainda não foram fotografadas, seguem em cinza sem quebrar
 * nada.
 */
export const ACERVO_TEM_FOTOS = true;

export const PLACEHOLDER_PRODUTO = "/placeholders/produto.webp";
export const PLACEHOLDER_DEPOIMENTO = "/placeholders/depoimento.webp";

/**
 * As seis fotos da seção "Conheça o Instagram".
 *
 * Ficam em /public e não no bucket porque são enfeite do site, não acervo: a
 * Lennys não as troca pelo painel, e servi-las estáticas evita uma ida ao
 * Storage no carregamento da home.
 *
 * Escolhidas para não repetir cor nem modelo — seis quadros do mesmo vestido
 * em ângulos diferentes leem como erro, não como galeria.
 */
export const FOTOS_INSTAGRAM = [
  "/fotos/instagram-1.webp",
  "/fotos/instagram-2.webp",
  "/fotos/instagram-3.webp",
  "/fotos/instagram-4.webp",
  "/fotos/instagram-5.webp",
  "/fotos/instagram-6.webp",
] as const;

/** Capa por slug de categoria, com queda para a de bordados. */
const PLACEHOLDER_CATEGORIA: Record<string, string> = {
  "casamento-civil": "/placeholders/categoria-bordados.webp",
  festa: "/placeholders/categoria-lisos.webp",
};

/**
 * Miniatura embutida usada como `placeholder="blur"`.
 *
 * O Next só gera isso sozinho para imagem importada estaticamente. Como o
 * `src` de produto e categoria vem do banco, o borrão precisa vir pronto.
 */
export const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRigAAABXRUJQVlA4IBwAAABwAQCdASoKAA8ABUB8JZwC7AF1AAD+79UVCcAA";

function urlDoBucket(caminho: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/produtos/${caminho}`;
}

/** URL da primeira foto do produto, ou o placeholder. */
export function imagemProduto(imagens: string[]): string {
  const primeira = imagens[0];
  if (!ACERVO_TEM_FOTOS || !primeira) return PLACEHOLDER_PRODUTO;
  return primeira.startsWith("http") ? primeira : urlDoBucket(primeira);
}

/**
 * Todas as fotos da peça, já resolvidas para URL.
 *
 * Peça sem foto devolve o placeholder, para a galeria sempre ter o que
 * mostrar em vez de renderizar vazio.
 */
export function imagensProduto(imagens: string[]): string[] {
  if (!ACERVO_TEM_FOTOS || !imagens.length) return [PLACEHOLDER_PRODUTO];
  return imagens.map((caminho) =>
    caminho.startsWith("http") ? caminho : urlDoBucket(caminho),
  );
}

/**
 * URL da segunda foto, usada no hover do card. Devolve `null` quando a peça
 * só tem uma foto — aí o card não monta a camada de troca.
 */
export function imagemProdutoSecundaria(imagens: string[]): string | null {
  const segunda = imagens[1];
  if (!ACERVO_TEM_FOTOS || !segunda) return null;
  return segunda.startsWith("http") ? segunda : urlDoBucket(segunda);
}

/** URL da capa da categoria, ou o placeholder correspondente ao slug. */
export function imagemCategoria(
  slug: string,
  imagemCapa: string | null,
): string {
  if (!ACERVO_TEM_FOTOS || !imagemCapa) {
    return PLACEHOLDER_CATEGORIA[slug] ?? PLACEHOLDER_CATEGORIA.festa;
  }
  // Mesmas duas formas de `urlDaMidia`: caminho que começa com barra veio
  // junto com o código, o resto está no bucket.
  return urlDaMidia(imagemCapa);
}

/**
 * URL de uma mídia do site (hero, feedback, reel).
 *
 * Aceita duas formas, e a distinção importa:
 *   `/fotos/algo.webp`  veio junto com o código, servido de /public
 *   `site/algo.webp`    foi enviado pelo painel, mora no bucket
 *
 * As duas convivem porque as imagens que já estavam no ar não precisaram ser
 * reenviadas para virarem editáveis. Quando a dona trocar uma, a nova entra
 * pelo bucket e a antiga simplesmente deixa de ser referenciada.
 */
export function urlDaMidia(arquivo: string): string {
  if (arquivo.startsWith("http")) return arquivo;
  if (arquivo.startsWith("/")) return arquivo;
  return urlDoBucket(arquivo);
}
