import type { Metadata } from "next";
import Link from "next/link";
import { BarraSuperior } from "@/components/acervo/barra-superior";
import { CapasColecoes } from "@/components/home/capas-colecoes";
import { CapaColecao } from "@/components/acervo/capa-colecao";
import { FiltrosMobile } from "@/components/acervo/filtros-mobile";
import { PainelFiltros } from "@/components/acervo/painel-filtros";
import { ProdutoCard } from "@/components/produto-card";
import { Container, Heading, estilosBotao } from "@/components/ui";
import {
  contarAtivos,
  escreverEstado,
  temFiltroAlemDaCategoria,
  lerEstado,
  PASSO_PAGINA,
  type SearchParams,
} from "@/lib/acervo/params";
import { paraFiltros } from "@/lib/acervo/params";
import { imagemCategoria } from "@/lib/images";
import {
  getAcervo,
  getCategorias,
  getConfiguracoes,
  getCupomAtivo,
  getFacetas,
} from "@/lib/queries";
import { SITE } from "@/lib/admin/site";
import { linkWhatsapp } from "@/lib/whatsapp";
import { OG_IMAGEM } from "@/lib/seo";

const TITULO =
  "Acervo | Vestidos de Noiva e de Festa para Alugar | Lennys Ateliê";
const DESCRICAO =
  "Vestidos de noiva, cerimônia, casamento civil, debutante e festa para alugar no Lennys Ateliê, em Jandira, SP. Filtre por coleção, cor, tamanho e preço.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  // Canonical sempre sem query: os filtros geram combinacoes infinitas do
  // mesmo conteudo, e sem isso o Google trataria cada uma como pagina
  // separada, diluindo o acervo em centenas de duplicatas.
  alternates: { canonical: `${SITE}/acervo` },
  openGraph: {
    images: [OG_IMAGEM],
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE}/acervo`,
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

export default async function AcervoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const estado = lerEstado(await searchParams);

  const [{ produtos, total }, facetas, { contato }, cupom] = await Promise.all([
    getAcervo(paraFiltros(estado)),
    getFacetas(),
    getConfiguracoes(),
    getCupomAtivo(),
  ]);

  const temMais = produtos.length < total;

  // Uma coleção escolhida e nenhum outro filtro: a página ganha a capa dela.
  // Com dois filtros ligados o recorte deixa de ser "a coleção" e a capa
  // passaria a mentir sobre o que está listado abaixo.
  const categorias = await getCategorias();
  const soUmaColecao =
    estado.categorias.length === 1 && !temFiltroAlemDaCategoria(estado);
  const colecao = soUmaColecao
    ? categorias.find((c) => c.slug === estado.categorias[0])
    : undefined;

  return (
    <Container as="main" className="flex flex-col gap-6 py-12">
      {colecao ? (
        <CapaColecao categoria={colecao} pecas={total} />
      ) : (
        <header className="flex flex-col gap-2">
          <Heading as={1} size="display-md" revelar>
            Acervo
          </Heading>
          <p className="max-w-prose text-sm text-ink-muted">
            {facetas.total} vestidos para alugar. Escolha a peça e a gente
            combina a data pelo WhatsApp.
          </p>
        </header>
      )}

      {/* As capas só aparecem no acervo inteiro. Depois que a visitante entra
          numa coleção, quem situa é a CapaColecao acima — repetir a fileira
          aqui ofereceria sair de uma coleção logo abaixo do título dela.

          A coleção também está nos filtros ao lado, mas filtro é lista de
          texto: quem ainda não sabe o que quer escolhe pela foto. */}
      {colecao ? null : (
        <section className="flex flex-col gap-4">
          <Heading as={2} size="display-sm" revelar>
            Coleções
          </Heading>
          <CapasColecoes
            capas={categorias.map((c) => ({
              id: c.id,
              nome: c.nome,
              slug: c.slug,
              imagem: imagemCategoria(c.slug, c.imagem_capa),
            }))}
          />
        </section>
      )}

      <div className="flex gap-12">
        <aside className="hidden w-70 shrink-0 lg:block">
          <PainelFiltros
            facetas={facetas}
            estado={estado}
            idPrefixo="desktop"
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <BarraSuperior
            estado={estado}
            total={total}
            filtro={
              <FiltrosMobile
                facetas={facetas}
                estado={estado}
                ativos={contarAtivos(estado)}
              />
            }
          />

          {produtos.length === 0 ? (
            <EstadoVazio whatsapp={contato.whatsapp} />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {produtos.map((produto, indice) => (
                  <li key={produto.id}>
                    <ProdutoCard
                      produto={produto}
                      sizes="(min-width: 1025px) 25vw, 50vw"
                      prioridade={indice < 4}
                      cupom={cupom}
                    />
                  </li>
                ))}
              </ul>

              {temMais ? (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <Link
                    href={escreverEstado({
                      ...estado,
                      mostrar: estado.mostrar + PASSO_PAGINA,
                    })}
                    scroll={false}
                    className={estilosBotao({ variant: "outline", size: "lg" })}
                  >
                    Carregar mais
                  </Link>
                  <p className="text-2xs text-ink-muted">
                    Mostrando {produtos.length} de {total}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

function EstadoVazio({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-line bg-surface-alt p-8">
      <Heading as={2} size="xl" revelar>
        Nenhum vestido com essa combinação
      </Heading>
      <p className="max-w-prose text-sm leading-base text-ink-muted">
        Tente soltar um dos filtros. Se você já sabe o que procura, chame a
        gente no WhatsApp: o acervo muda toda semana e nem tudo entra no site no
        mesmo dia.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/acervo"
          className="border border-ink px-6 py-3 text-xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand hover:border-accent hover:text-accent-ink"
        >
          Limpar filtros
        </Link>
        <a
          href={linkWhatsapp(
            whatsapp,
            "Oi! Procurei no site e não achei o que queria. Pode me ajudar?",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg" })}
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
