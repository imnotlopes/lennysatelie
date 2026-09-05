import type { Metadata } from "next";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { FAQ } from "@/lib/faq";
import { getConfiguracoes } from "@/lib/queries";
import { linkWhatsapp } from "@/lib/whatsapp";
import { SITE } from "@/lib/admin/site";
import { OG_IMAGEM } from "@/lib/seo";

const TITULO = "Perguntas frequentes | Lennys Ateliê";
const DESCRICAO =
  "Dúvidas sobre prova, prazo, tamanho, ajustes e cuidados com o vestido alugado.";
const CAMINHO = "/perguntas-frequentes";

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

/**
 * JSON-LD de FAQ. O Google usa para mostrar as perguntas direto no resultado
 * de busca, e boa parte das dúvidas do ateliê é exatamente o que a cliente
 * digita lá ("quantos dias dura o aluguel de vestido").
 */
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((grupo) =>
      grupo.perguntas.map((p) => ({
        "@type": "Question",
        name: p.pergunta,
        acceptedAnswer: {
          "@type": "Answer",
          text: p.resposta.join(" "),
        },
      })),
    ),
  };
}

export default async function PerguntasFrequentesPage() {
  const { contato } = await getConfiguracoes();

  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
      />

      <header className="flex max-w-prose flex-col gap-3">
        <Heading as={1} size="display-md" revelar>
          Perguntas frequentes
        </Heading>
        <p className="text-base leading-base text-ink-muted">
          As dúvidas que mais chegam por aqui. Se a sua não estiver na lista,
          chame no WhatsApp que a gente responde.
        </p>
      </header>

      {FAQ.map((grupo) => (
        <section key={grupo.titulo} className="flex flex-col gap-6">
          <h2 className="text-2xs tracking-caps uppercase text-ink-muted">
            {grupo.titulo}
          </h2>

          <dl className="flex flex-col">
            {grupo.perguntas.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="flex flex-col gap-2 border-t border-line py-6 scroll-mt-20"
              >
                <dt className="font-display text-lg leading-tight text-ink">
                  {item.pergunta}
                </dt>
                <dd className="flex max-w-prose flex-col gap-2">
                  {item.resposta.map((paragrafo) => (
                    <p
                      key={paragrafo}
                      className="text-base leading-base text-ink-muted"
                    >
                      {paragrafo}
                    </p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div className="flex flex-col gap-3 border-t border-line pt-8">
        <p className="max-w-prose text-base leading-base text-ink">
          Não achou o que procurava?
        </p>
        <a
          href={linkWhatsapp(
            contato.whatsapp,
            "Olá! Tenho uma dúvida que não encontrei nas perguntas frequentes.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg", className: "self-start" })}
        >
          Perguntar no WhatsApp
        </a>
      </div>
    </Container>
  );
}
