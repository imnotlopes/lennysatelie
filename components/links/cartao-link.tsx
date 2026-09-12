"use client";

import { ICONES_LINK } from "@/components/links/icones";
import { registrarClique } from "@/components/links/usar-clique";
import { cn } from "@/lib/utils";
import type { Link as LinkRow } from "@/lib/supabase/types";

/**
 * Um card da lista.
 *
 * O `destaque` é o card preto: é para onde a Lennys quer que a pessoa vá, e
 * numa lista de seis botões iguais nenhum é escolhido. A regra de um só por
 * vez mora no painel.
 *
 * Altura mínima de 11 unidades: é o alvo de toque de 44px que o WCAG pede, e
 * esta página é quase inteiramente aberta no celular.
 */
export function CartaoLink({ link }: { link: LinkRow }) {
  const Icone = ICONES_LINK[link.icone];
  const externo = !link.url.startsWith("mailto:");

  return (
    <a
      href={link.url}
      {...(externo
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      onClick={() => registrarClique(link.id)}
      className={cn(
        "group flex min-h-11 items-center gap-4 border px-5 py-4",
        "transition-colors duration-200 ease-brand",
        link.destaque
          ? "border-ink bg-ink text-ink-inverse hover:bg-ink/90"
          : "border-line bg-surface-raised text-ink hover:border-ink",
      )}
    >
      <Icone className="size-5 shrink-0" />

      <span className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
        <span className="text-2xs tracking-caps uppercase">{link.titulo}</span>
        {link.subtitulo ? (
          <span
            className={cn(
              "text-xs",
              link.destaque ? "text-ink-inverse/75" : "text-ink-muted",
            )}
          >
            {link.subtitulo}
          </span>
        ) : null}
      </span>

      {/* Seta de "sai daqui". Decorativa: o destino já está no título. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-200 ease-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}
