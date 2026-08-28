import { Container, Heading } from "@/components/ui";
import { DEPOIMENTOS_ESCRITOS } from "@/lib/depoimentos";

export interface DepoimentosEscritosProps {
  /** Fora de um Container, para a página de peça que já tem um. */
  semContainer?: boolean;
}

/**
 * Galeria de relatos escritos.
 *
 * Em colunas CSS, e não em grade: os relatos vão de uma linha a dez, e numa
 * grade a linha inteira ganha a altura do maior, abrindo buracos entre os
 * curtos. Coluna deixa cada um ocupar só o que precisa.
 *
 * Sem foto e sem moldura pesada de propósito — o que sustenta a seção é o que
 * a cliente escreveu, não o enfeite em volta.
 */
export function DepoimentosEscritos({
  semContainer = false,
}: DepoimentosEscritosProps) {
  if (!DEPOIMENTOS_ESCRITOS.length) return null;

  const conteudo = (
    <>
      <div className="flex flex-col gap-2">
        <Heading as={2} size="display-sm" revelar>
          O que elas dizem depois
        </Heading>
        <p className="max-w-prose text-xs text-ink-muted">
          Mensagens que chegaram no WhatsApp do ateliê, publicadas com
          autorização.
        </p>
      </div>

      <ul className="columns-1 gap-6 md:columns-2 lg:columns-3">
        {DEPOIMENTOS_ESCRITOS.map((depoimento) => (
          <li
            key={depoimento.citacao}
            className="mb-6 break-inside-avoid border-t border-line pt-4"
          >
            <blockquote className="flex flex-col gap-3">
              <p className="text-sm leading-base text-ink">
                {depoimento.citacao}
              </p>
              <footer className="text-2xs tracking-caps uppercase text-ink-muted">
                {depoimento.nome ?? "Cliente do ateliê"}
                {depoimento.ocasiao ? ` — ${depoimento.ocasiao}` : ""}
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
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
