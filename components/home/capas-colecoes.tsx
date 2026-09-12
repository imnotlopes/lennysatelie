import Image from "next/image";
import Link from "next/link";
import { Esteira } from "@/components/home/esteira";

export interface CapaResumo {
  id: string;
  nome: string;
  slug: string;
  imagem: string;
}

/** Quanto tempo cada capa fica na tela antes de dar a vez. */
const MS_POR_CAPA = 2000;

/**
 * As capas das coleções, numa fileira de tamanho fixo.
 *
 * Quatro lugares no desktop, dois no tablet e um no celular. Com mais coleções
 * que lugares, elas passam pelos lugares em vez de a fileira crescer — quem
 * cuida disso é a `Esteira`, que também para no toque e respeita quem pediu
 * menos movimento.
 *
 * Server Component: os cartões são montados aqui e a esteira só escolhe quais
 * aparecem, então nada disto vai para o pacote do browser.
 */
export function CapasColecoes({ capas }: { capas: CapaResumo[] }) {
  const itens = capas.map((capa) => ({
    chave: capa.id,
    rotulo: `Ver a coleção ${capa.nome}`,
    conteudo: <Capa capa={capa} />,
  }));

  return (
    <Esteira
      itens={itens}
      lugares={{ base: 1, sm: 2, lg: 4 }}
      ms={MS_POR_CAPA}
      classeFileira="gap-4 sm:grid-cols-2 lg:grid-cols-4"
    />
  );
}

function Capa({ capa }: { capa: CapaResumo }) {
  return (
    <Link href={`/acervo?categoria=${capa.slug}`} className="group block">
      <div
        data-revelar="zoom"
        // O observador de revelar escreve `data-visivel` neste elemento depois
        // que a página monta. Sem isto o React reclama da diferença entre o
        // HTML do servidor e o do browser.
        suppressHydrationWarning
        className="relative aspect-3/4 w-full overflow-hidden bg-surface-alt sm:aspect-4/5"
      >
        <Image
          src={capa.imagem}
          alt={`Vestidos da coleção ${capa.nome}`}
          fill
          // Sem `priority`: a fileira fica abaixo da dobra em qualquer tela, e
          // o preload só roubava banda do hero, que é o que a visitante está de
          // fato olhando. No celular a mais pesada delas chegava a 112KB, mais
          // que o próprio hero.
          loading="lazy"
          sizes="(min-width: 1025px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />

        <span aria-hidden="true" className="absolute inset-0 bg-black/30" />

        <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5">
          <span className="font-display text-xl leading-none tracking-default text-ink-inverse uppercase sm:text-display-sm">
            {capa.nome}
          </span>
          <span className="border-b border-ink-inverse pb-1 text-2xs tracking-caps uppercase text-ink-inverse">
            Ver todos
          </span>
        </span>
      </div>
    </Link>
  );
}
