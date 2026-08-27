"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeFechar } from "@/components/icons";
import type { EstadoAcervo } from "@/lib/acervo/params";
import type { Facetas } from "@/lib/queries";
import { estilosBotao } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PainelFiltros } from "./painel-filtros";

export interface FiltrosMobileProps {
  facetas: Facetas;
  estado: EstadoAcervo;
  /** Quantos filtros estão ligados. Vira contador no botão. */
  ativos: number;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Botão "Filtrar" fixo no rodapé e o drawer que ele abre, abaixo de 1025px.
 *
 * Mesmas garantias do menu de navegação: fundo não rola, Escape fecha, Tab
 * circula dentro do painel e o foco volta para o botão.
 */
export function FiltrosMobile({ facetas, estado, ativos }: FiltrosMobileProps) {
  const [aberto, setAberto] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const fechar = useCallback(() => setAberto(false), []);

  useEffect(() => {
    if (!aberto) return;

    // Copiado para variavel: na limpeza do efeito o ref ja pode ter mudado.
    const botao = botaoRef.current;
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painelRef.current?.querySelector<HTMLElement>(FOCAVEIS)?.focus();

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fechar();
        return;
      }
      if (evento.key !== "Tab") return;

      const alvos = painelRef.current?.querySelectorAll<HTMLElement>(FOCAVEIS);
      if (!alvos?.length) return;
      const inicio = alvos[0];
      const fim = alvos[alvos.length - 1];

      if (evento.shiftKey && document.activeElement === inicio) {
        evento.preventDefault();
        fim.focus();
      } else if (!evento.shiftKey && document.activeElement === fim) {
        evento.preventDefault();
        inicio.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowOriginal;
      botao?.focus();
    };
  }, [aberto, fechar]);

  return (
    <div className="lg:hidden">
      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto(true)}
        className={estilosBotao({ variant: "outline", size: "md" })}
      >
        Filtrar
        {ativos > 0 ? (
          <span className="flex size-4 items-center justify-center rounded-full bg-ink text-2xs text-ink-inverse">
            {ativos}
          </span>
        ) : null}
      </button>

      <div className={cn(!aberto && "pointer-events-none")} aria-hidden={!aberto}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Fechar filtros"
          onClick={fechar}
          className={cn(
            "fixed inset-0 z-40 bg-surface-alt/90 transition-opacity duration-300 ease-soft",
            aberto ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={painelRef}
          role="dialog"
          aria-modal={aberto || undefined}
          aria-label="Filtros do acervo"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-80 flex-col",
            "border-r border-line bg-surface",
            "transition-transform duration-300 ease-soft",
            aberto ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-xs font-bold tracking-default text-ink">
              Filtros
            </h2>
            <button
              type="button"
              onClick={fechar}
              className="flex size-9 items-center justify-center text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
            >
              <IconeFechar />
              <span className="sr-only">Fechar filtros</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <PainelFiltros
              facetas={facetas}
              estado={estado}
              aoAplicar={fechar}
              idPrefixo="mobile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
