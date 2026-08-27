"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  escreverEstado,
  ORDENACOES,
  PASSO_PAGINA,
  temFiltroAtivo,
  type EstadoAcervo,
  type OrdemAcervo,
} from "@/lib/acervo/params";
import { cn } from "@/lib/utils";

export interface BarraSuperiorProps {
  estado: EstadoAcervo;
  total: number;
  /**
   * Botão de filtrar do celular e do tablet. Entra aqui, ao lado de
   * "Ordenar", porque é onde se procura por ele. Antes era uma barra fixa no
   * rodapé: cobria o fim da grade, brigava com a bolinha do WhatsApp e só
   * sumia acima de 1025px, então no tablet ficava pior ainda.
   */
  filtro?: ReactNode;
}

/** Contagem de resultados, filtro, ordenação e limpar filtros. */
export function BarraSuperior({ estado, total, filtro }: BarraSuperiorProps) {
  const router = useRouter();

  function ordenar(ordem: OrdemAcervo) {
    router.push(
      escreverEstado({ ...estado, ordem, mostrar: PASSO_PAGINA }),
      { scroll: false },
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
      <p className="text-xs text-ink" aria-live="polite">
        {total === 0
          ? "Nenhum vestido"
          : total === 1
            ? "1 vestido"
            : `${total} vestidos`}
      </p>

      <div className="flex items-center gap-3 sm:gap-4">
        {filtro}

        {temFiltroAtivo(estado) ? (
          <button
            type="button"
            onClick={() => router.push("/acervo", { scroll: false })}
            className="text-2xs tracking-caps uppercase text-accent-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-ink"
          >
            Limpar filtros
          </button>
        ) : null}

        <div className="flex items-center gap-2">
          <label htmlFor="ordenar" className="text-2xs text-ink-muted">
            Ordenar
          </label>
          <select
            id="ordenar"
            value={estado.ordem}
            onChange={(e) => ordenar(e.target.value as OrdemAcervo)}
            className={cn(
              "h-9 cursor-pointer rounded-none border border-line-strong bg-surface-raised px-2",
              "text-xs tracking-default text-ink",
              "transition-colors duration-200 ease-brand focus:border-ink focus:outline-none",
            )}
          >
            {ORDENACOES.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
