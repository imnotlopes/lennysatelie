import { headers } from "next/headers";
import type { MetadataRoute } from "next";
import { HOST_LINKS, SITE, SITE_LINKS } from "@/lib/admin/site";

/**
 * O painel e o styleguide ficam fora do índice.
 *
 * O painel já exige senha, mas bloquear aqui evita que a URL apareça em
 * resultado de busca. O styleguide é ferramenta interna e indexá-lo só
 * geraria página sem valor competindo com o acervo.
 *
 * RESPONDE CONFORME O HOST. Para o Google, `links.lennysatelie.com.br` é outro
 * site: ele busca o robots.txt daquele host e espera encontrar ali o sitemap
 * daquele host. Servir o do domínio principal apontaria o rastreador para um
 * sitemap cheio de URLs de outro domínio, que ele ignora.
 *
 * Ler o cabeçalho torna esta rota dinâmica. É um arquivo de texto pedido uma
 * vez por rastreamento; o custo é irrelevante perto de servir o arquivo
 * errado.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.toLowerCase();
  const base = host === HOST_LINKS ? SITE_LINKS : SITE;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/styleguide"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
