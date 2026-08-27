import type { MetadataRoute } from "next";
import { SITE } from "@/lib/admin/site";
import { getProdutoSlugs } from "@/lib/queries";

/**
 * Sitemap gerado do banco.
 *
 * Só entram peças ativas: anunciar ao Google um vestido que saiu do acervo
 * gera visita que termina em página de erro.
 *
 * As URLs com filtro do acervo ficam de fora de propósito — são combinações
 * infinitas do mesmo conteúdo, e é por isso que a página do acervo declara
 * canonical sem query.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/acervo`, lastModified: agora, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/como-funciona`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/perguntas-frequentes`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contato`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const slugs = await getProdutoSlugs();
    return [
      ...fixas,
      ...slugs.map(({ slug }) => ({
        url: `${SITE}/acervo/${slug}`,
        lastModified: agora,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // Banco fora do ar não pode derrubar o sitemap inteiro: as fixas ainda
    // valem e o Google volta depois.
    return fixas;
  }
}
