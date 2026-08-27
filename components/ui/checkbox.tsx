import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  label: string;
  error?: string;
}

/**
 * Caixa quadrada de 15px, cantos vivos, marcada em acento — o mesmo
 * tratamento dos filtros da referência.
 */
export function Checkbox({
  id,
  label,
  error,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          className={cn(
            "size-3 shrink-0 cursor-pointer appearance-none rounded-none",
            "border border-line-strong bg-surface-raised",
            "transition-colors duration-200 ease-brand",
            "checked:border-accent checked:bg-accent",
            "hover:border-accent",
            "disabled:cursor-not-allowed disabled:border-disabled disabled:bg-surface-alt",
            error && "border-error",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />

        <label
          htmlFor={id}
          className={cn(
            "cursor-pointer text-xs tracking-default",
            disabled ? "cursor-not-allowed text-ink-faded" : "text-ink",
          )}
        >
          {label}
        </label>
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-2xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
