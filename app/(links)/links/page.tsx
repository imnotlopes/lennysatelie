import type { Metadata } from "next";
import { CartaoLink } from "@/components/links/cartao-link";
import { FaixaColecoes } from "@/components/links/faixa-colecoes";
import { RodapeAtalhos } from "@/components/links/rodape-atalhos";
import { MosaicoDepoimentos } from "@/components/secoes/mosaico-depoimentos";
import { getLinks, getMidias } from "@/lib/queries";
import { SITE, SITE_LINKS } from "@/lib/admin/site";

const TITULO = "Lennys Ateliê | Vestidos de noiva e de festa em Jandira, SP";
const DESCRICAO =
  "WhatsApp, acervo, site e redes do Lennys Ateliê. Alta costura em vestidos de noiva e de festa, feitos no ateliê, em Jandira, SP.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  // O canonical aponta para o próprio subdomínio, não para o site: as duas
  // páginas têm conteúdos diferentes e cada uma vale por si na busca.
  alternates: { canonical: SITE_LINKS },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: SITE_LINKS,
    siteName: "Lennys Ateliê",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
};

/**
 * A página de links, servida em links.lennysatelie.com.br.
 *
 * É o destino do link da bio: quem chega veio do Instagram, está no celular e
 * decide em dois segundos. Por isso a ordem — marca, a frase que diz o que
 * separa este ateliê dos outros, os botões, e só depois a prova.
 *
 * Reusa a identidade do site (tokens, tipografia, ícones) mas não a casca:
 * sem header, sem menu, sem rodapé de navegação. Uma página de links com menu
 * em cima é um site pequeno, e aí ela não serve para o que existe.
 *
 * A coluna é estreita e centrada em qualquer largura. No desktop ela não vira
 * grade: a página é feita para o polegar, e no computador ela continua sendo
 * a mesma coisa, só com margem maior.
 */
export default async function LinksPage() {
  const [links, prints] = await Promise.all([
    getLinks(),
    getMidias("feedback_mensagem"),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-130 flex-col gap-10 px-4 py-12">
      <header className="flex flex-col items-center gap-4 text-center">
        <a
          href={SITE}
          className="flex flex-col items-center gap-2 text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
        >
          <span
            aria-hidden="true"
            className="marca-simbolo block aspect-102/160 h-12"
          />
          <span className="font-display text-display-sm leading-none tracking-default">
            Lennys Ateliê
          </span>
        </a>

        <span className="text-2xs tracking-caps uppercase text-ink-muted">
          Jandira · São Paulo
        </span>

        {/* A headline diz o ofício; a linha de baixo é a da Lennys e diz a
            promessa. Nenhuma palavra se repete entre as duas de propósito —
            "sonho" e "alta costura" moram na frase dela, então a de cima fala
            de molde e ponto. */}
        <h1 className="font-display text-display-md leading-tight tracking-default text-ink text-balance">
          Do molde ao último ponto.
        </h1>

        <p className="max-w-prose text-sm leading-base text-ink-muted text-balance">
          Seus sonhos transformados em realidade, com a exclusividade da alta
          costura.
        </p>
      </header>

      {links.length ? (
        <nav aria-label="Links do ateliê">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.id}>
                <CartaoLink link={link} />
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <FaixaColecoes site={SITE} />

      {prints.length ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-center text-2xs tracking-caps uppercase text-ink-muted">
            No WhatsApp do ateliê
          </h2>
          {/* Os mesmos prints do site, lidos da mesma tabela: ela gerencia num
              lugar só e eles aparecem nos dois. Aqui num bloco de dois — a
              prova é apoio nesta página, não assunto. */}
          <MosaicoDepoimentos mensagens={prints} fotos={[]} compacto />
        </section>
      ) : null}

      <footer className="flex flex-col items-center gap-5 border-t border-line pt-8 text-center">
        <RodapeAtalhos links={links} />

        <div className="flex flex-col items-center gap-1">
          <a
            href={SITE}
            className="text-2xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            lennysatelie.com.br
          </a>
          <span className="text-2xs text-ink-faded">
            © {new Date().getFullYear()} Lennys Ateliê
          </span>
        </div>
      </footer>
    </main>
  );
}
