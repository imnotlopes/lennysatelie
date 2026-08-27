import Image from "next/image";
import { Carrossel } from "@/components/home/carrossel";
import { Container, Heading } from "@/components/ui";
import { DEPOIMENTOS } from "@/lib/depoimentos";
import { BLUR_DATA_URL, PLACEHOLDER_DEPOIMENTO } from "@/lib/images";

export interface DepoimentosProps {
  /** Fora de um Container, para a página de produto que já tem um. */
  semContainer?: boolean;
}

/**
 * Depoimentos de clientes. Mesma seção na home e na página de produto.
 *
 * Some sozinha quando não há depoimento cadastrado — carrossel vazio com
 * título em cima é pior que nada.
 */
export function Depoimentos({ semContainer = false }: DepoimentosProps) {
  if (!DEPOIMENTOS.length) return null;

  const conteudo = (
    <>
      <Heading as={2} size="display-sm" revelar>
        Quem já alugou
      </Heading>

      <Carrossel
        rotulo="Depoimentos de clientes"
        larguraItem="basis-4/5 sm:basis-1/2 lg:basis-1/3"
      >
        {DEPOIMENTOS.map((depoimento) => (
          <figure
            key={depoimento.instagram}
            className="flex h-full flex-col gap-4 border border-line bg-surface-raised p-6"
          >
            <blockquote className="text-sm leading-base text-ink">
              {depoimento.citacao}
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <Image
                src={depoimento.foto || PLACEHOLDER_DEPOIMENTO}
                alt=""
                width={40}
                height={40}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="size-10 rounded-full object-cover"
              />
              <span className="flex flex-col">
                <span className="text-xs text-ink">{depoimento.nome}</span>
                <span className="text-2xs text-ink-muted">
                  {depoimento.instagram}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </Carrossel>
    </>
  );

  if (semContainer) {
    return (
      <section className="flex flex-col gap-6 border-t border-line pt-12">
        {conteudo}
      </section>
    );
  }

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      {conteudo}
    </Container>
  );
}
