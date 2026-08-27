"use client";

import { useState } from "react";

export interface FaixaPrecoProps {
  min: number;
  max: number;
  valorMin: number;
  valorMax: number;
  /** Disparado ao soltar o controle, não a cada pixel arrastado. */
  aoMudar: (min: number, max: number) => void;
  formatar: (valor: number) => string;
}

/**
 * Slider duplo de faixa de preço.
 *
 * São dois `input[type=range]` sobrepostos em vez de um controle desenhado do
 * zero: assim o teclado, o leitor de tela e o toque funcionam de graça. Só o
 * trilho é estilizado.
 *
 * O valor só sobe para a URL no `change` (soltar), não no `input` (arrastar),
 * senão cada pixel viraria uma navegação.
 */
export function FaixaPreco({
  min,
  max,
  valorMin,
  valorMax,
  aoMudar,
  formatar,
}: FaixaPrecoProps) {
  const [inicio, setInicio] = useState(valorMin);
  const [fim, setFim] = useState(valorMax);
  const [ultimos, setUltimos] = useState({ min: valorMin, max: valorMax });

  // A URL e a fonte da verdade: se ela mudar por fora (voltar no historico,
  // limpar filtros), o controle acompanha.
  //
  // O ajuste acontece durante a render, e nao num efeito. E o padrao que o
  // React recomenda para estado derivado de prop: sincronizar por efeito
  // renderiza uma vez com o valor velho antes de corrigir.
  if (ultimos.min !== valorMin || ultimos.max !== valorMax) {
    setUltimos({ min: valorMin, max: valorMax });
    setInicio(valorMin);
    setFim(valorMax);
  }

  if (min >= max) return null;

  const pctInicio = ((inicio - min) / (max - min)) * 100;
  const pctFim = ((fim - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-6">
        {/* Trilho */}
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line-strong" />
        {/* Trecho selecionado */}
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-accent"
          style={{ left: `${pctInicio}%`, right: `${100 - pctFim}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={inicio}
          aria-label="Preço mínimo"
          onChange={(e) => setInicio(Math.min(Number(e.target.value), fim))}
          onMouseUp={() => aoMudar(inicio, fim)}
          onTouchEnd={() => aoMudar(inicio, fim)}
          onKeyUp={() => aoMudar(inicio, fim)}
          className="faixa-preco__controle"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={fim}
          aria-label="Preço máximo"
          onChange={(e) => setFim(Math.max(Number(e.target.value), inicio))}
          onMouseUp={() => aoMudar(inicio, fim)}
          onTouchEnd={() => aoMudar(inicio, fim)}
          onKeyUp={() => aoMudar(inicio, fim)}
          className="faixa-preco__controle"
        />
      </div>

      <p className="text-2xs text-ink-muted">
        {formatar(inicio)} até {formatar(fim)}
      </p>
    </div>
  );
}
