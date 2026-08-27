import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Field, controlBase, controlBorder, describedBy } from "./field";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  /** Classe aplicada ao container, não ao controle. */
  wrapperClassName?: string;
}

export function Input({
  id,
  label,
  error,
  hint,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <Field
      htmlFor={id}
      label={label}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <input
        id={id}
        className={cn(controlBase, controlBorder(Boolean(error)), "h-9 px-3", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </Field>
  );
}
