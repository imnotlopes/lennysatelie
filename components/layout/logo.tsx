import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  /** Esconde o símbolo e deixa só o nome. Para espaços muito estreitos. */
  semSimbolo?: boolean;
}

/**
 * Marca do ateliê: símbolo e nome em Marcellus.
 *
 * A Lennys ainda não tem logo desenhado. O símbolo é uma ilustração de linha
 * provisória, aplicada como máscara CSS (ver `.marca-simbolo` em globals.css)
 * para herdar a cor do contexto — claro sobre o hero, escuro no header sólido
 * e no rodapé.
 *
 * Quando existir a marca definitiva, troque `public/marca/simbolo.png` e o
 * texto abaixo. O resto do site não muda.
 */
export function Logo({ className, semSimbolo = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-current",
        "transition-colors duration-200 ease-brand hover:text-accent-ink",
        className,
      )}
    >
      {!semSimbolo ? (
        <span
          aria-hidden="true"
          className="marca-simbolo block aspect-102/160 h-8 shrink-0"
        />
      ) : null}

      <span className="font-display text-display-sm leading-none tracking-default">
        Lennys Ateliê
      </span>
    </Link>
  );
}
