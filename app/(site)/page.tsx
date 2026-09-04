import { CategoriasGrid } from "@/components/home/categorias-grid";
import { ComoFunciona } from "@/components/home/como-funciona";
import { Feedbacks } from "@/components/secoes/feedbacks";
import { Destaques } from "@/components/home/destaques";
import { FaixaWhatsapp } from "@/components/home/faixa-whatsapp";
import { Hero } from "@/components/home/hero";
import { LocalBusinessJsonLd } from "@/components/seo/local-business";
import { SecaoVideos } from "@/components/secoes/videos";
import { SITE } from "@/lib/admin/site";
import { getConfiguracoes } from "@/lib/queries";
import type { Metadata } from "next";

const TITULO = "Lennys Ateliê | Aluguel de Vestidos de Festa em Jandira, SP";
const DESCRICAO =
  "Vestidos de festa, noiva e casamento civil para alugar. Prova com hora marcada, ajuste incluso e reserva pelo WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: SITE },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: SITE,
    siteName: "Lennys Ateliê",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
};

/**
 * Home. Server Component: nenhuma das seções precisa de estado no browser.
 * O único componente de cliente da página é o carrossel, usado pelos
 * destaques e pelos depoimentos.
 */
export default async function HomePage() {
  const { contato } = await getConfiguracoes();

  return (
    <main className="flex flex-col">
      <LocalBusinessJsonLd contato={contato} />
      <Hero />
      <CategoriasGrid />
      <Destaques />
      <ComoFunciona />
      <SecaoVideos contato={contato} />
      <Feedbacks />
      <FaixaWhatsapp />
    </main>
  );
}
