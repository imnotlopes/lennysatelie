import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Moldura compartilhada por Input, Textarea e Select: rótulo, mensagem de
 * erro e texto de apoio. Mantém o espaçamento e a tipografia iguais nos três.
 */
export interface FieldProps {
  /** Precisa bater com o `id` do controle para o rótulo funcionar. */
  htmlFor: string;
  label?: string;
  /** Quando presente, o campo entra em estado de erro. */
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  htmlFor,
  label,
  error,
  hint,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-xs tracking-default text-ink">
          {label}
        </label>
      ) : null}

      {children}

      {error ? (
        <p id={`${htmlFor}-error`} className="text-2xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-2xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Traço e tipografia comuns aos controles de texto. */
export const controlBase = [
  "w-full rounded-none border bg-surface-raised",
  "font-sans text-xs tracking-default text-ink",
  "transition-colors duration-200 ease-brand",
  "focus:border-ink focus:outline-none",
  "disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-faded",
].join(" ");

export function controlBorder(hasError: boolean): string {
  return hasError ? "border-error" : "border-line-strong";
}

/** Liga o controle à mensagem de erro ou de apoio para leitores de tela. */
export function describedBy(
  id: string,
  error?: string,
  hint?: string,
): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
