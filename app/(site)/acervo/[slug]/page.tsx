import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AplicarCupom } from "@/components/cupom/aplicar-cupom";
import { Reserva } from "@/components/produto/reserva";
import { Selos } from "@/components/produto/selos";
import { Galeria } from "@/components/produto/galeria";
import { RegistrarVisita } from "@/components/produto/registrar-visita";
import { VistosRecentemente } from "@/components/produto/vistos-recentemente";
import { Depoimentos } from "@/components/secoes/depoimentos";
import { SecaoInstagram } from "@/components/secoes/instagram";
import { ProdutoCard } from "@/components/produto-card";
import { Container, Heading, Preco } from "@/components/ui";
import { imagemProduto, imagensProduto } from "@/lib/images";
import {
  getConfiguracoes,
  getCupomAtivo,
  getProdutoBySlug,
  getProdutoSlugs,
  getProdutosRelacionados,
} from "@/lib/queries";
import type { ProdutoComCategoria } from "@/lib/supabase/types";
import { SITE } from "@/lib/admin/site";



/**
 * Slugs pre-gerados no build, uma pagina por peca ativa.
 *
 * `dynamicParams` fica true de proposito. Com false, slug fora desta lista
 * devolveria 404 de verdade — mas `generateStaticParams` so roda no build, e
 * uma peca cadastrada pelo painel ficaria inacessivel ate o proximo deploy.
 * Entre um soft 404 em slug inexistente e uma peca nova que nao aparece, o
 * segundo e o problema grave: e o painel da dona do atelie que quebra.
 *
 * O soft 404 fica para a Etapa 11, junto com o tratamento de peca desativada
 * (que pede 410 ou redirect, nao 404).
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProdutoSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);

  // notFound() aqui, e nao so no componente: o generateMetadata roda antes,
  // e se ele resolver com sucesso o Next ja transmite a resposta com status
  // 200 — a pagina de erro aparece, mas o Google indexa como conteudo real.
  if (!produto) notFound();

  const titulo = `${produto.nome} | Aluguel de Vestidos de Festa | Lennys Ateliê`;
  const descricao =
    produto.descricao?.trim() ||
    `${produto.nome} para alugar no Lennys Ateliê, em Jandira, SP. Reserve pelo WhatsApp.`;
  const imagem = imagemProduto(produto.imagens);

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `${SITE}/acervo/${produto.slug}` },
    openGraph: {
      title: titulo,
      description: descricao,
      url: `${SITE}/acervo/${produto.slug}`,
      siteName: "Lennys Ateliê",
      type: "website",
      locale: "pt_BR",
      images: [{ url: imagem.startsWith("http") ? imagem : `${SITE}${imagem}` }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao },
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug);

  if (!produto) notFound();

  const [relacionados, { contato, whatsappTemplate }, cupom] =
    await Promise.all([
      getProdutosRelacionados(produto.categoria_id, produto.id),
      getConfiguracoes(),
      getCupomAtivo(),
    ]);

  const url = `${SITE}/acervo/${produto.slug}`;
  const imagens = imagensProduto(produto.imagens);

  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <RegistrarVisita produtoId={produto.id} />
      <JsonLd produto={produto} url={url} />

      <nav aria-label="Você está em" className="text-2xs text-ink-muted">
        <Link href="/acervo" className="transition-colors hover:text-accent-ink">
          Acervo
        </Link>
        {produto.categoria ? (
          <>
            {" / "}
            <Link
              href={`/acervo?categoria=${produto.categoria.slug}`}
              className="transition-colors hover:text-accent-ink"
            >
              {produto.categoria.nome}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Galeria imagens={imagens} nome={produto.nome} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            {produto.categoria ? (
              <span className="text-2xs tracking-caps uppercase text-ink-muted">
                {produto.categoria.nome}
              </span>
            ) : null}
            <Heading as={1} size="display-sm" revelar>
              {produto.nome}
            </Heading>
          </div>

          <Preco produto={produto} cupom={cupom} tamanho="lg" />

          {/* A cor é informação da peça, não pergunta: a cliente precisa
              saber qual é, mas não escolhe. */}
          {produto.cor ? (
            <p className="text-xs text-ink-muted">Cor: {produto.cor}</p>
          ) : null}

          {produto.descricao ? (
            <p className="max-w-prose text-sm leading-base text-ink">
              {produto.descricao}
            </p>
          ) : null}

          <Reserva
            produto={produto}
            url={url}
            numeroWhatsapp={contato.whatsapp}
            template={whatsappTemplate.mensagem}
            cupom={cupom}
          />

          <AplicarCupom jaTemCupom={Boolean(cupom)} />

          <Selos />
        </div>
      </div>

      {relacionados.length ? (
        <section className="flex flex-col gap-6 border-t border-line pt-12">
          <Heading as={2} size="display-sm" revelar>
            Você também vai gostar
          </Heading>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {relacionados.map((item) => (
              <li key={item.id}>
                <ProdutoCard
                  produto={item}
                  sizes="(min-width: 1025px) 25vw, 50vw"
                  cupom={cupom}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Vem depois dos relacionados: a recomendacao do atelie pesa mais que
          o historico dela, e quem ja viu a peca nao precisa ser lembrada
          primeiro do que ja olhou. Some sozinha na primeira visita. */}
      <VistosRecentemente slugAtual={produto.slug} cupom={cupom} />

      <Depoimentos semContainer />

      <SecaoInstagram contato={contato} semContainer />
    </Container>
  );
}

/**
 * Dados estruturados para o Google.
 *
 * `offers` só entra quando há preço: anunciar `price: 0` faria a peça
 * aparecer como gratuita nos resultados de busca.
 */
function JsonLd({ produto, url }: { produto: ProdutoComCategoria; url: string }) {
  const imagem = imagemProduto(produto.imagens);

  const dados: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: produto.nome,
    image: [imagem.startsWith("http") ? imagem : `${SITE}${imagem}`],
    description:
      produto.descricao?.trim() ||
      `${produto.nome} para alugar no Lennys Ateliê.`,
    brand: { "@type": "Brand", name: "Lennys Ateliê" },
    url,
  };

  if (produto.preco_locacao !== null) {
    dados.offers = {
      "@type": "Offer",
      price: produto.preco_locacao,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
