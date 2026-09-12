"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconeSetaDireita, IconeSetaEsquerda } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface CarrosselProps {
  /** Rótulo acessível da região. Ex.: "Queridinhos do momento". */
  rotulo: string;
  /** Largura de cada item. Controla quantos aparecem por vez. */
  larguraItem?: string;
  children: ReactNode;
}

/**
 * Carrossel horizontal.
 *
 * O arraste por toque é o scroll nativo do navegador com `scroll-snap`, não
 * um handler de ponteiro: rola com inércia no celular, funciona com roda de
 * mouse e trackpad, e continua navegável por teclado. As setas existem só no
 * desktop, onde não há gesto.
 *
 * Usado pelos destaques da home e pelas peças vistas recentemente.
 */
export function Carrossel({
  rotulo,
  larguraItem = "basis-2/3 sm:basis-1/2 lg:basis-1/4",
  children,
}: CarrosselProps) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [temAnterior, setTemAnterior] = useState(false);
  const [temProximo, setTemProximo] = useState(false);

  const medir = useCallback(() => {
    const el = trilhoRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setTemAnterior(el.scrollLeft > 8);
    setTemProximo(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = trilhoRef.current;
    if (!el) return;
    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [medir]);

  function deslizar(direcao: -1 | 1) {
    const el = trilhoRef.current;
    if (!el) return;
    const primeiro = el.firstElementChild as HTMLElement | null;
    const passo = primeiro ? primeiro.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: passo * direcao, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trilhoRef}
        role="region"
        aria-label={rotulo}
        tabIndex={0}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth",
          // Esconde a barra sem tirar a rolagem.
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {Array.isArray(children)
          ? children.map((filho, i) => (
              <div key={i} className={cn("shrink-0 snap-start", larguraItem)}>
                {filho}
              </div>
            ))
          : children}
      </div>

      <Seta
        lado="esquerda"
        visivel={temAnterior}
        aoClicar={() => deslizar(-1)}
      />
      <Seta lado="direita" visivel={temProximo} aoClicar={() => deslizar(1)} />
    </div>
  );
}

function Seta({
  lado,
  visivel,
  aoClicar,
}: {
  lado: "esquerda" | "direita";
  visivel: boolean;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={!visivel}
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
      className={cn(
        "absolute top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center lg:flex",
        "border border-line-strong bg-surface text-ink",
        "transition-opacity duration-200 ease-brand",
        "hover:border-accent hover:text-accent-ink",
        lado === "esquerda" ? "-left-4" : "-right-4",
        visivel ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {lado === "esquerda" ? <IconeSetaEsquerda /> : <IconeSetaDireita />}
      <span className="sr-only">
        {lado === "esquerda" ? "Anterior" : "Próximo"}
      </span>
    </button>
  );
}
