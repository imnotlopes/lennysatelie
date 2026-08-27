import type { ReactNode } from "react";
import { BannerCupom } from "@/components/cupom/banner-cupom";
import { ObservadorRevelacao } from "@/components/efeitos/observador-revelacao";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsappFloat } from "@/components/layout/whatsapp-float";
import { getConfiguracoes, getCupomAtivo } from "@/lib/queries";
import { linkWhatsapp } from "@/lib/whatsapp";

/**
 * Casca do site público: banner de cupom, header, rodapé e botão flutuante.
 *
 * O site é revalidado de hora em hora. Na prática a leitura do cookie de
 * cupom já torna as rotas dinâmicas — ver a nota da Etapa 11 no documento de
 * prompts.
 */
export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [{ contato }, cupom] = await Promise.all([
    getConfiguracoes(),
    getCupomAtivo(),
  ]);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:border focus:border-accent-ink focus:bg-surface focus:px-3 focus:py-2 focus:text-xs"
      >
        Pular para o conteúdo
      </a>

      {cupom ? <BannerCupom cupom={cupom} /> : null}

      <SiteHeader />

      <div id="conteudo" className="flex flex-1 flex-col">
        {children}
      </div>

      <ObservadorRevelacao />
      <SiteFooter />
      <WhatsappFloat href={linkWhatsapp(contato.whatsapp)} />
    </>
  );
}
