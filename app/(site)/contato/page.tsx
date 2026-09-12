import type { Metadata } from "next";
import Link from "next/link";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { getConfiguracoes } from "@/lib/queries";
import { linkWhatsapp } from "@/lib/whatsapp";
import { SITE } from "@/lib/admin/site";
import { OG_IMAGEM } from "@/lib/seo";
import { MapaAtelie } from "@/components/secoes/mapa-atelie";
import { AvaliacoesGoogle } from "@/components/secoes/avaliacoes-google";
import { HORARIOS } from "@/lib/horarios";
import { Parcerias } from "@/components/secoes/parcerias";

const TITULO = "Contato e Endereço em Jandira, SP | Lennys Ateliê";
const DESCRICAO =
  "Onde fica o Lennys Ateliê, em Jandira, SP: mapa, endereço, telefone, WhatsApp e horário. Confeccionamos também no atacado, para lojas e ateliês.";
const CAMINHO = "/contato";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE}${CAMINHO}` },
  openGraph: {
    images: [OG_IMAGEM],
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE}${CAMINHO}`,
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

export default async function ContatoPage() {
  const { contato } = await getConfiguracoes();
  const instagram = contato.instagram?.trim();

  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <header className="flex max-w-prose flex-col gap-3">
        <Heading as={1} size="display-md" revelar>
          Contato
        </Heading>
        <p className="text-base leading-base text-ink-muted">
          O atendimento é com hora marcada, para você provar com calma. Chame no
          WhatsApp que a gente encontra um horário.
        </p>
        <a
          href={linkWhatsapp(
            contato.whatsapp,
            "Olá! Gostaria de agendar um horário para conhecer os vestidos.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg", className: "mt-2 self-start" })}
        >
          Agendar meu horário
        </a>
      </header>

      <AvaliacoesGoogle semContainer />

      <MapaAtelie contato={contato} semCabecalho />

      <div className="grid gap-12 md:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-2xs tracking-caps uppercase text-ink-muted">
            Onde ficamos
          </h2>
          <address className="text-base leading-base text-ink not-italic">
            {contato.endereco}
          </address>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contato.endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-xs text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            Ver no mapa
          </a>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xs tracking-caps uppercase text-ink-muted">
            Horário de atendimento
          </h2>
          <dl className="flex flex-col gap-2">
            {HORARIOS.map((item) => (
              <div
                key={item.dias}
                className="flex justify-between gap-4 border-b border-line pb-2 last:border-0"
              >
                <dt className="text-base text-ink">{item.dias}</dt>
                <dd className="text-base text-ink-muted">{item.horas}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xs tracking-caps uppercase text-ink-muted">
            Falar com a gente
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href={linkWhatsapp(contato.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
              >
                {contato.telefone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contato.email}`}
                className="text-base text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
              >
                {contato.email}
              </a>
            </li>
            {instagram ? (
              <li>
                <a
                  href={`https://instagram.com/${instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
                >
                  {instagram}
                </a>
              </li>
            ) : null}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xs tracking-caps uppercase text-ink-muted">
            Antes de vir
          </h2>
          <p className="max-w-prose text-base leading-base text-ink-muted">
            Vale dar uma olhada no acervo e separar as peças que você quer
            provar. Elas já ficam prontas para a sua visita.
          </p>
          <Link
            href="/acervo"
            className={estilosBotao({
              variant: "outline",
              size: "lg",
              className: "self-start",
            })}
          >
            Ver o acervo
          </Link>
        </section>
      </div>

      <Parcerias whatsapp={contato.whatsapp} />
    </Container>
  );
}
