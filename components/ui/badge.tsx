import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "accent" | "success" | "error" | "ink";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-line text-ink",
  accent: "bg-accent text-ink",
  success: "bg-success text-ink-inverse",
  error: "bg-error text-ink-inverse",
  /** Sobre foto de produto: precisa vencer qualquer cor de vestido atrás. */
  ink: "bg-ink text-ink-inverse",
};

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

/** Etiqueta curta sobre foto de produto ou ao lado de um título. */
export function Badge({
  variant = "neutral",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none px-2 py-0.5",
        "text-2xs tracking-caps uppercase leading-none",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
