"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CapaResumo {
  id: string;
  nome: string;
  slug: string;
  imagem: string;
}

/** Quanto tempo cada capa fica na tela antes de dar a vez. */
const MS_POR_CAPA = 2000;

/** Quantos lugares a fileira tem, por largura de tela. */
function lugaresPara(largura: number): number {
  if (largura >= 1025) return 4;
  if (largura >= 640) return 2;
  return 1;
}

/**
 * Quantos lugares o servidor desenha, antes de saber o tamanho da tela.
 *
 * Um. A versão anterior começava em quatro e encolhia depois que o script
 * media a tela: no celular a página nascia com quatro cartões empilhados e
 * encolhia embaixo do dedo, e as fotos que sumiam já tinham sido baixadas.
 *
 * Esconder os lugares extras por CSS não resolve — foi a primeira tentativa e
 * ficou pior. Imagem `lazy` dentro de `display: none` continua sendo baixada,
 * então o telefone passou a buscar três capas em vez de duas. Medido.
 *
 * Começar em um e crescer não causa salto: as colunas da grade são fixas pelo
 * CSS, então acrescentar cartões preenche colunas vazias à direita sem mudar a
 * altura da fileira. No celular, que é uma coluna só, nunca chega a crescer.
 */
const LUGARES_INICIAIS = 1;

/**
 * As capas das coleções, numa fileira de tamanho fixo.
 *
 * A fileira tem quatro lugares no desktop, dois no tablet e um no celular. Com
 * mais coleções que lugares, elas passam pelos lugares em vez de a fileira
 * crescer: cinco cards numa linha de quatro empurrariam o quinto para uma
 * segunda fileira solta, e cada card ficaria menor para caber.
 *
 * Cada lugar mostra a coleção `(atual + posição)`, e `atual` anda de um em um.
 * O efeito é de esteira: as capas caminham para a esquerda e a que sai volta
 * pela direita.
 *
 * É componente de cliente por causa disso. Poderia ser CSS puro como o hero,
 * mas cada capa é um LINK: se trocar no meio do toque, a cliente abre a
 * coleção errada. Com JavaScript dá para parar assim que o dedo encosta.
 *
 * O número de lugares desenhados é sempre o mesmo, no servidor e no cliente.
 * O que muda por tela é quais deles o CSS mostra — ver `VISIBILIDADE`.
 */
export function CapasColecoes({ capas }: { capas: CapaResumo[] }) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const [lugares, setLugares] = useState(LUGARES_INICIAIS);
  const menosMovimento = useRef(false);

  useEffect(() => {
    menosMovimento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const medir = () => setLugares(lugaresPara(window.innerWidth));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // Só faz sentido girar quando há mais coleção que lugar na fileira.
  const gira = capas.length > lugares;

  useEffect(() => {
    if (!gira || parado || menosMovimento.current) return;

    const id = window.setInterval(
      () => setAtual((i) => (i + 1) % capas.length),
      MS_POR_CAPA,
    );
    return () => window.clearInterval(id);
  }, [gira, parado, capas.length]);

  const mostradas = Array.from(
    { length: Math.min(lugares, capas.length) },
    (_, posicao) => capas[(atual + posicao) % capas.length],
  );

  return (
    <div className="flex flex-col gap-3">
      <ul
        onPointerDown={() => setParado(true)}
        onFocusCapture={() => setParado(true)}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {mostradas.map((capa, posicao) => (
          <li key={posicao}>
            <Link
              href={`/acervo?categoria=${capa.slug}`}
              className="group block"
            >
              <div
                // A chave muda quando a coleção daquele lugar muda, o que
                // remonta o bloco e dispara a entrada suave. Sem isso a troca
                // seria um corte seco, que foi como ficou na primeira versão.
                key={capa.id}
                data-revelar="zoom"
                suppressHydrationWarning
                className={cn(
                  "relative aspect-3/4 w-full overflow-hidden bg-surface-alt sm:aspect-4/5",
                  gira && "capa-entrando",
                )}
              >
                <Image
                  src={capa.imagem}
                  alt={`Vestidos da coleção ${capa.nome}`}
                  fill
                  // Sem `priority`: a fileira fica abaixo da dobra em
                  // qualquer tela, e o preload só roubava banda do hero, que é
                  // o que a visitante está de fato olhando. No celular a mais
                  // pesada delas chegava a 112KB, mais que o próprio hero.
                  loading="lazy"
                  sizes="(min-width: 1025px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top"
                />

                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/30"
                />

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
          </li>
        ))}
      </ul>

      {/* Pontinhos: um por coleção, para a visitante saber quantas existem e
          poder ir direto. Só aparecem quando a fileira gira — parada, todas
          já estão à vista. */}
      {gira ? (
        <div className="flex justify-center gap-2">
          {capas.map((capa, indice) => (
            <button
              key={capa.id}
              type="button"
              aria-label={`Ver a coleção ${capa.nome}`}
              aria-current={indice === atual ? "true" : undefined}
              onClick={() => {
                setAtual(indice);
                setParado(true);
              }}
              className={cn(
                "size-2 rounded-full transition-colors duration-200 ease-brand",
                indice === atual ? "bg-ink" : "bg-line-strong",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
