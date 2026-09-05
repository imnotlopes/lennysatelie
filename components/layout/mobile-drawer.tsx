"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconeFechar } from "@/components/icons";
import type { ItemNavegacao } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** O que o menu precisa saber de uma coleção. */
export interface ColecaoDoMenu {
  slug: string;
  nome: string;
}

export interface MobileDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
  itens: ItemNavegacao[];
  colecoes: ColecaoDoMenu[];
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
  colecoes,
  pathname,
}: MobileDrawerProps) {
  // Segundo nível do menu, como no site que o Edson trouxe de referência: a
  // lista de coleções desliza por cima da principal, com uma volta no topo.
  const [vendoColecoes, setVendoColecoes] = useState(false);

  // Fechar volta ao primeiro nível. Sem isto a gaveta reabria na lista de
  // coleções, e quem quisesse "Contato" tinha que voltar antes.
  const fechar = useCallback(() => {
    setVendoColecoes(false);
    aoFechar();
  }, [aoFechar]);
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
      focoAnterior.current?.focus();
    };
  }, [aberto, fechar]);

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
        onClick={fechar}
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
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          {vendoColecoes ? (
            <button
              type="button"
              onClick={() => setVendoColecoes(false)}
              className="flex min-h-9 items-center gap-2 text-xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
            >
              <IconeVoltar />
              Coleções
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={fechar}
            className="flex size-9 items-center justify-center text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            <IconeFechar />
            <span className="sr-only">Fechar menu</span>
          </button>
        </div>

        {vendoColecoes ? (
          <nav aria-label="Coleções" className="flex flex-col px-4 py-4">
            <Link
              href="/acervo"
              onClick={fechar}
              className="border-b border-line py-3 text-sm tracking-wide text-ink-muted transition-colors duration-200 ease-brand hover:text-accent-ink"
            >
              Ver o acervo inteiro
            </Link>
            {colecoes.map((c) => (
              <Link
                key={c.slug}
                href={`/acervo?categoria=${c.slug}`}
                onClick={fechar}
                className="border-b border-line py-3 text-sm tracking-wide text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
              >
                {c.nome}
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="flex flex-col px-4 py-4">
            {itens.map((item) => {
              const ativo =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              // As coleções penduram no Acervo, que é a página delas. Soltas
              // no fim da lista, depois de "Contato", pareciam outra seção do
              // site — e não são: são recortes do acervo.
              //
              // Dois alvos na mesma linha, cada um com o seu papel: o texto
              // leva ao acervo inteiro, a seta abre a lista de coleções.
              const temColecoes =
                item.href === "/acervo" && colecoes.length > 0;

              return (
                <div
                  key={item.href}
                  className="flex items-center gap-2 border-b border-line"
                >
                  <Link
                    href={item.href}
                    onClick={fechar}
                    aria-current={ativo ? "page" : undefined}
                    className={cn(
                      "flex-1 py-3 text-sm tracking-wide",
                      "transition-colors duration-200 ease-brand hover:text-accent-ink",
                      ativo ? "text-accent-ink" : "text-ink",
                    )}
                  >
                    {item.rotulo}
                  </Link>

                  {temColecoes ? (
                    <button
                      type="button"
                      onClick={() => setVendoColecoes(true)}
                      aria-label="Ver as coleções"
                      aria-expanded={false}
                      className="flex size-11 shrink-0 items-center justify-center text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
                    >
                      <IconeAvancar />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

/** Seta para a direita: entra no segundo nível. */
function IconeAvancar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/** Seta para a esquerda: volta ao primeiro nível. */
function IconeVoltar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
