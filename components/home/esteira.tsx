"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ItemEsteira {
  /**
   * Estável e única por item.
   *
   * É o que dispara a entrada suave: quando um lugar troca de item, a chave
   * daquele bloco muda, o React remonta e a animação roda de novo.
   */
  chave: string;
  /** Rótulo do pontinho. Ex.: "Ver a coleção Festa". */
  rotulo: string;
  /**
   * O cartão pronto. Vem montado de fora, quase sempre do servidor: a esteira
   * só decide quais aparecem, não sabe o que tem dentro.
   */
  conteudo: ReactNode;
}

/**
 * Quantos lugares a fileira tem, por faixa de largura.
 *
 * Objeto e não função porque isto atravessa a fronteira do servidor para o
 * cliente, e função não é serializável.
 */
export interface LugaresEsteira {
  /** Celular. Também é o que o servidor desenha, antes de medir a tela. */
  base: number;
  /** A partir de 640px. Sem isto, repete `base`. */
  sm?: number;
  /** A partir de 1025px. Sem isto, repete `sm` ou `base`. */
  lg?: number;
}

export interface EsteiraProps {
  itens: ItemEsteira[];
  lugares: LugaresEsteira;
  /** Quanto tempo cada item fica na tela antes de dar a vez. */
  ms: number;
  /** Classes da fileira. Precisa declarar as colunas e o espaçamento. */
  classeFileira: string;
}

/**
 * Uma fileira de tamanho fixo por onde os itens passam.
 *
 * Com mais itens que lugares, eles caminham para a esquerda e o que sai volta
 * pela direita — em vez de a fileira crescer. Cinco cartões numa linha de
 * quatro empurrariam o quinto para uma segunda fileira solta, e cada cartão
 * ficaria menor para caber.
 *
 * Para no primeiro toque ou quando o foco entra, e nunca começa para quem
 * pediu menos movimento no sistema. Parar importa porque o conteúdo costuma
 * ser clicável: trocar no meio do toque abre o link errado.
 *
 * O número de lugares desenhado no servidor é sempre `lugares.base`, o do
 * celular. Começar pelo maior faria o telefone nascer com cartões a mais e
 * encolher embaixo do dedo depois que o script medisse a tela — e as fotos
 * que sumissem já teriam sido baixadas. Esconder por CSS não resolve: imagem
 * `lazy` dentro de `display: none` continua sendo baixada.
 *
 * Crescer não causa salto, porque as colunas da grade são fixas pelo CSS:
 * acrescentar cartões preenche colunas vazias à direita sem mudar a altura.
 */
export function Esteira({ itens, lugares, ms, classeFileira }: EsteiraProps) {
  const { base, sm, lg } = lugares;
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const [quantos, setQuantos] = useState(base);
  const menosMovimento = useRef(false);

  useEffect(() => {
    menosMovimento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const medir = () => {
      const largura = window.innerWidth;
      if (largura >= 1025) setQuantos(lg ?? sm ?? base);
      else if (largura >= 640) setQuantos(sm ?? base);
      else setQuantos(base);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [base, sm, lg]);

  // Só faz sentido girar quando há mais item que lugar na fileira.
  const gira = itens.length > quantos;

  useEffect(() => {
    if (!gira || parado || menosMovimento.current) return;

    const id = window.setInterval(
      () => setAtual((i) => (i + 1) % itens.length),
      ms,
    );
    return () => window.clearInterval(id);
  }, [gira, parado, itens.length, ms]);

  const mostrados = Array.from(
    { length: Math.min(quantos, itens.length) },
    (_, posicao) => itens[(atual + posicao) % itens.length],
  );

  return (
    <div className="flex flex-col gap-3">
      <ul
        onPointerDown={() => setParado(true)}
        onFocusCapture={() => setParado(true)}
        className={cn("grid", classeFileira)}
      >
        {mostrados.map((item, posicao) => (
          <li key={posicao} className="h-full">
            <div
              key={item.chave}
              className={cn("h-full", gira && "esteira-entrando")}
            >
              {item.conteudo}
            </div>
          </li>
        ))}
      </ul>

      {/* Pontinhos: um por item, para a visitante saber quantos existem e
          poder ir direto. Só aparecem quando a fileira gira — parada, todos
          já estão à vista. */}
      {gira ? (
        <div className="flex justify-center gap-2">
          {itens.map((item, indice) => (
            <button
              key={item.chave}
              type="button"
              aria-label={item.rotulo}
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
