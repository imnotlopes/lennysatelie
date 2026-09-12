"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FaixaProps {
  /** Rótulo acessível da faixa. Ex.: "Coleções do ateliê". */
  rotulo: string;
  /**
   * Uma volta completa, em segundos.
   *
   * Quem calibra é o olho, não a conta: o mesmo tempo com itens maiores move
   * objetos maiores, e a velocidade aparente dobra sem o relógio mudar.
   */
  segundos?: number;
  /** Os itens, já montados. A faixa desenha a lista duas vezes. */
  children: ReactNode;
}

/**
 * Faixa que desliza sozinha, sem começo nem fim visíveis.
 *
 * COMO O LAÇO FECHA
 * -----------------
 * A lista é desenhada DUAS vezes e o trilho anda até -50%. Nesse ponto a
 * segunda cópia está exatamente onde a primeira começou, e o salto de volta ao
 * zero não aparece.
 *
 * O que quebra isso é o espaçamento: com `gap` entre os itens, metade do
 * trilho não é uma cópia inteira, é uma cópia menos meio vão, e a faixa dá um
 * tranco a cada volta. Por isso o respiro é `padding` DENTRO de cada item —
 * ver `.faixa_item` no globals.css.
 *
 * PARAR É EXIGÊNCIA, NÃO CORTESIA
 * -------------------------------
 * Conteúdo que se move sozinho por mais de cinco segundos precisa ter como
 * parar (WCAG 2.2.2). Aqui há três caminhos, e nenhum ocupa espaço na tela:
 * quem pediu menos movimento no sistema nunca vê a faixa andar, quem usa mouse
 * para ao passar por cima, e quem navega por teclado encontra o botão ao
 * chegar com Tab — mesmo padrão do "pular para o conteúdo".
 *
 * O buraco que fica: alguém sensível a movimento, no celular, sem a
 * preferência do sistema ligada. Fica registrado.
 */
export function Faixa({ rotulo, segundos = 30, children }: FaixaProps) {
  const [parada, setParada] = useState(false);

  return (
    <div>
      <div className="faixa" role="region" aria-label={rotulo}>
        <div
          className={cn("faixa_trilho", parada && "esta-parada")}
          style={{ animationDuration: `${segundos}s` }}
        >
          <div className="faixa_fileira">{children}</div>
          {/* A segunda cópia é só desenho. Sem `aria-hidden`, quem usa leitor
              de tela ouve a lista inteira duas vezes e conclui que há o dobro
              de coleções. */}
          <div className="faixa_fileira" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setParada((estava) => !estava)}
          aria-pressed={parada}
          className={cn(
            "sr-only mt-4 focus:not-sr-only focus:inline-flex focus:min-h-11",
            "focus:items-center focus:px-3 focus:text-2xs focus:tracking-caps",
            "focus:uppercase focus:text-ink",
          )}
        >
          {parada ? "Retomar o movimento" : "Pausar o movimento"}
        </button>
      </div>
    </div>
  );
}
