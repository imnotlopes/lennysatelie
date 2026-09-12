import type { Metadata } from "next";
import Link from "next/link";
import { montarDestinos } from "@/components/home/como-funciona";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { PASSOS } from "@/lib/como-funciona";
import { getConfiguracoes } from "@/lib/queries";
import { SITE } from "@/lib/admin/site";
import { OG_IMAGEM } from "@/lib/seo";

const TITULO = "Como Alugar seu Vestido de Noiva | Lennys Ateliê";
const DESCRICAO =
  "Da prova à devolução: como funciona o aluguel de vestido de noiva e de festa no Lennys Ateliê, em Jandira, SP.";
const CAMINHO = "/como-funciona";

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

export default async function ComoFuncionaPage() {
  const { contato } = await getConfiguracoes();
  const destino = montarDestinos(contato.whatsapp, contato.instagram);

  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <header className="flex max-w-prose flex-col gap-3">
        <Heading as={1} size="display-md" revelar>
          Como funciona
        </Heading>
        <p className="text-base leading-base text-ink-muted">
          Do primeiro contato à devolução, em seis passos. Todas as peças são
          feitas por nós, aqui no ateliê. Qualquer dúvida no meio do caminho,
          é só chamar no WhatsApp.
        </p>
      </header>

      <ol className="flex flex-col">
        {PASSOS.map((passo, indice) => (
          <li
            key={passo.titulo}
            className="flex flex-col gap-4 border-t border-line py-8 md:flex-row md:gap-8"
          >
            <div className="flex items-center gap-3 md:w-50 md:shrink-0 md:flex-col md:items-start md:gap-2">
              <passo.icone className="size-6 shrink-0 text-accent-ink" />
              <span className="text-2xs tracking-caps uppercase text-ink-muted">
                Passo {indice + 1}
              </span>
            </div>

            <div className="flex max-w-prose flex-col gap-3">
              <Heading as={2} size="xl" revelar>
                {passo.titulo}
              </Heading>

              {passo.chamada ? (
                <p className="text-2xs tracking-caps uppercase text-accent-ink">
                  {passo.chamada}
                </p>
              ) : null}

              <p className="text-base leading-base text-ink-muted">
                {passo.texto}
              </p>

              {passo.acao.principal ? (
                <Link
                  href={destino[passo.acao.destino]}
                  {...(passo.acao.destino === "whatsapp"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={estilosBotao({
                    size: "lg",
                    className: "self-start",
                  })}
                >
                  {passo.acao.rotulo}
                </Link>
              ) : (
                <Link
                  href={destino[passo.acao.destino]}
                  {...(passo.acao.destino === "whatsapp" ||
                  passo.acao.destino === "instagram"
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="self-start text-xs text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
                >
                  {passo.acao.rotulo}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 border-t border-line pt-8">
        <p className="max-w-prose text-base leading-base text-ink">
          Ficou com alguma dúvida sobre prazo, pagamento ou tamanho?
        </p>
        <Link
          href="/perguntas-frequentes"
          className={estilosBotao({
            variant: "outline",
            size: "lg",
            className: "self-start",
          })}
        >
          Ver as perguntas frequentes
        </Link>
      </div>
    </Container>
  );
}
