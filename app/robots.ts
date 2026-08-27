import type { MetadataRoute } from "next";
import { SITE } from "@/lib/admin/site";

/**
 * O painel e o styleguide ficam fora do índice.
 *
 * O painel já exige senha, mas bloquear aqui evita que a URL apareça em
 * resultado de busca. O styleguide é ferramenta interna e indexá-lo só
 * geraria página sem valor competindo com o acervo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/styleguide"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
