import Image from "next/image";
import { Container, Heading } from "@/components/ui";
import { BLUR_DATA_URL, urlDaMidia } from "@/lib/images";
import { getMidias } from "@/lib/queries";

/**
 * Clientes com a peça e o relato na mesma imagem.
 *
 * São as artes de story que o próprio ateliê publicou: foto e texto já vêm
 * juntos, no formato 9:16. Entram como estão, sem recorte — separar o texto da
 * foto destruiria a composição que a Shakira montou.
 *
 * Em trilho horizontal com rolagem, e não em grade: são seis peças altas, e
 * empilhar isso numa página que já é comprida cansa antes da metade.
 */
export async function FeedbacksComImagem() {
  const itens = await getMidias("feedback_imagem");
  if (!itens.length) return null;

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <div className="flex flex-col gap-2">
        <Heading as={2} size="display-sm" revelar>
          Elas vestiram, elas contaram
        </Heading>
        <p className="max-w-prose text-xs text-ink-muted">
          Publicações do nosso Instagram, com o que cada cliente escreveu
          depois do evento.
        </p>
      </div>

      <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {itens.map((item) => (
          <li
            key={item.id}
            className="w-56 shrink-0 snap-start sm:w-64 lg:w-72"
          >
            <div className="relative aspect-9/16 w-full overflow-hidden bg-surface-alt">
              <Image
                src={urlDaMidia(item.arquivo)}
                alt={item.texto_alt ?? ""}
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1025px) 18vw, 60vw"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}

/**
 * As mensagens como chegaram no WhatsApp.
 *
 * Aqui o texto está dentro da imagem, então o `alt` carrega a transcrição
 * inteira. É o que sustenta a seção para quem usa leitor de tela e é o que o
 * Google lê — sem isso seriam treze retângulos sem conteúdo nenhum.
 *
 * Colunas em vez de grade: os prints têm alturas bem diferentes, e numa grade
 * a linha inteira ganha a altura do maior.
 */
export async function FeedbacksPorMensagem() {
  const itens = await getMidias("feedback_mensagem");
  if (!itens.length) return null;

  return (
    <div className="bg-surface-alt">
      <Container as="section" className="flex flex-col gap-6 py-12">
        <div className="flex flex-col gap-2">
          <Heading as={2} size="display-sm" revelar>
            O que elas dizem depois
          </Heading>
          <p className="max-w-prose text-xs text-ink-muted">
            Mensagens que chegaram no WhatsApp do ateliê, publicadas com
            autorização.
          </p>
        </div>

        <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {itens.map((item) => (
            <li key={item.id} className="mb-3 break-inside-avoid">
              <Image
                src={urlDaMidia(item.arquivo)}
                alt={item.texto_alt ?? ""}
                width={340}
                height={470}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1025px) 22vw, 45vw"
                className="h-auto w-full bg-surface-raised"
              />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
