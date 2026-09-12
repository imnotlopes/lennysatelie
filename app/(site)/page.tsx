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
import { OG_IMAGEM } from "@/lib/seo";
import { MapaAtelie } from "@/components/secoes/mapa-atelie";
import { AvaliacoesGoogle } from "@/components/secoes/avaliacoes-google";

const TITULO = "Aluguel de Vestido de Noiva em Jandira, SP | Lennys Ateliê";
const DESCRICAO =
  "Vestidos de noiva, casamento civil e festa para alugar em Jandira, SP. Feitos no nosso ateliê, com prova marcada, ajuste incluso e reserva pelo WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: SITE },
  openGraph: {
    images: [OG_IMAGEM],
    title: TITULO,
    description: DESCRICAO,
    url: SITE,
    siteName: "Lennys Ateliê",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
  },
};

/**
 * Home. Server Component: nenhuma das seções precisa de estado no browser.
 * O que roda no browser são dois componentes internos — o carrossel dos
 * destaques e a esteira das fileiras que giram.
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
      <AvaliacoesGoogle />
      <Feedbacks />
      <MapaAtelie contato={contato} />
      <FaixaWhatsapp />
    </main>
  );
}
