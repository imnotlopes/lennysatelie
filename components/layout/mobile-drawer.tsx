"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { IconeFechar } from "@/components/icons";
import type { ItemNavegacao } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
  itens: ItemNavegacao[];
  pathname: string;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * Navegação lateral para telas abaixo de 1025px.
 *
 * Enquanto está aberto: o fundo não rola, Escape fecha, o Tab circula dentro
 * do painel e o foco volta para o botão que abriu.
 *
 * A transição usa translate/opacity. Quem pediu menos movimento no sistema
 * operacional recebe a troca instantânea, pela regra global de
 * prefers-reduced-motion em globals.css.
 */
export function MobileDrawer({
  aberto,
  aoFechar,
  itens,
  pathname,
}: MobileDrawerProps) {
  const painelRef = useRef<HTMLDivElement>(null);
  const focoAnterior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    focoAnterior.current = document.activeElement as HTMLElement | null;

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const primeiro = painelRef.current?.querySelector<HTMLElement>(FOCAVEIS);
    primeiro?.focus();

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        aoFechar();
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
      focoAnterior.current?.focus();
    };
  }, [aberto, aoFechar]);

  return (
    <div
      className={cn("lg:hidden", !aberto && "pointer-events-none")}
      aria-hidden={!aberto}
    >
      {/* Véu. O overlay do sistema de referência é creme, não preto. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar menu"
        onClick={aoFechar}
        className={cn(
          "fixed inset-0 z-40 bg-surface-alt/90",
          "transition-opacity duration-300 ease-soft",
          aberto ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal={aberto || undefined}
        aria-label="Menu de navegação"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-4/5 max-w-72 flex-col",
          "border-l border-line bg-surface",
          "transition-transform duration-300 ease-soft",
          aberto ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-end border-b border-line px-4 py-3">
          <button
            type="button"
            onClick={aoFechar}
            className="flex size-9 items-center justify-center text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            <IconeFechar />
            <span className="sr-only">Fechar menu</span>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4">
          {itens.map((item) => {
            const ativo =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={aoFechar}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "border-b border-line py-3 text-sm tracking-wide",
                  "transition-colors duration-200 ease-brand hover:text-accent-ink",
                  ativo ? "text-accent-ink" : "text-ink",
                )}
              >
                {item.rotulo}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
