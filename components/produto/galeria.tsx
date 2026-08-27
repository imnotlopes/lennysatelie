"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

export interface GaleriaProps {
  imagens: string[];
  /** Vira o alt da imagem principal. */
  nome: string;
}

/**
 * Galeria do produto.
 *
 * Desktop: thumbs verticais à esquerda e zoom no hover, com o ponto de origem
 * seguindo o cursor. Mobile: thumbs horizontais abaixo e navegação por arraste
 * (scroll nativo com snap, mesma escolha do carrossel da home).
 *
 * Com uma imagem só, thumbs e arraste somem — não há o que navegar.
 */
export function Galeria({ imagens, nome }: GaleriaProps) {
  const [ativa, setAtiva] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origem, setOrigem] = useState("50% 50%");
  const trilhoRef = useRef<HTMLDivElement>(null);

  const varias = imagens.length > 1;

  function aoMover(evento: React.MouseEvent<HTMLDivElement>) {
    const r = evento.currentTarget.getBoundingClientRect();
    const x = ((evento.clientX - r.left) / r.width) * 100;
    const y = ((evento.clientY - r.top) / r.height) * 100;
    setOrigem(`${x}% ${y}%`);
  }

  function aoRolarTrilho() {
    const el = trilhoRef.current;
    if (!el) return;
    const indice = Math.round(el.scrollLeft / el.clientWidth);
    setAtiva(Math.min(Math.max(indice, 0), imagens.length - 1));
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Thumbs verticais, só no desktop */}
      {varias ? (
        <ul className="order-2 hidden shrink-0 flex-col gap-2 lg:order-1 lg:flex">
          {imagens.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setAtiva(i)}
                aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
                aria-current={i === ativa}
                className={cn(
                  "relative block aspect-product w-16 overflow-hidden border",
                  "transition-colors duration-200 ease-brand",
                  i === ativa
                    ? "border-ink"
                    : "border-transparent hover:border-accent",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Imagem principal: no desktop, uma só com zoom */}
      <div
        className="order-1 hidden min-w-0 flex-1 lg:order-2 lg:block"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={aoMover}
      >
        <div className="relative aspect-product w-full overflow-hidden bg-surface-alt">
          <Image
            src={imagens[ativa]}
            alt={`Vestido ${nome}`}
            fill
            priority
            sizes="(min-width: 1025px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={cn(
              "object-cover transition-transform duration-300 ease-soft",
              "motion-reduce:transform-none",
              zoom ? "scale-150" : "scale-100",
            )}
            style={{ transformOrigin: origem }}
          />
        </div>
      </div>

      {/* Mobile: trilho arrastável com snap */}
      <div className="order-1 lg:hidden">
        <div
          ref={trilhoRef}
          onScroll={aoRolarTrilho}
          role="region"
          aria-label={`Fotos do vestido ${nome}`}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {imagens.map((src, i) => (
            <div
              key={src}
              className="relative aspect-product w-full shrink-0 snap-start bg-surface-alt"
            >
              <Image
                src={src}
                alt={i === 0 ? `Vestido ${nome}` : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {varias ? (
          <p className="pt-2 text-2xs text-ink-muted" aria-live="polite">
            Foto {ativa + 1} de {imagens.length}
          </p>
        ) : null}
      </div>
    </div>
  );
}
