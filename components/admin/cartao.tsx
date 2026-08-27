import type { ReactNode } from "react";

export interface CartaoProps {
  rotulo: string;
  valor: ReactNode;
  /** Linha pequena embaixo, para contexto. */
  detalhe?: string;
}

/** Número isolado do dashboard. */
export function Cartao({ rotulo, valor, detalhe }: CartaoProps) {
  return (
    <div className="flex flex-col gap-1 border border-line bg-surface-raised p-4">
      <span className="text-2xs tracking-caps uppercase text-ink-muted">
        {rotulo}
      </span>
      <span className="font-display text-display-sm leading-none text-ink">
        {valor}
      </span>
      {detalhe ? (
        <span className="text-2xs text-ink-muted">{detalhe}</span>
      ) : null}
    </div>
  );
}
