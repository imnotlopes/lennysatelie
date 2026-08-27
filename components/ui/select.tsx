import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Field, controlBase, controlBorder, describedBy } from "./field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children"> {
  id: string;
  options: SelectOption[];
  label?: string;
  error?: string;
  hint?: string;
  /** Primeira opção, sem valor. Use para "Todos", "Selecione" e afins. */
  placeholder?: string;
  wrapperClassName?: string;
}

export function Select({
  id,
  options,
  label,
  error,
  hint,
  placeholder,
  className,
  wrapperClassName,
  ...props
}: SelectProps) {
  return (
    <Field
      htmlFor={id}
      label={label}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={id}
          className={cn(
            controlBase,
            controlBorder(Boolean(error)),
            "h-9 cursor-pointer appearance-none pl-3 pr-8",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <Chevron />
      </div>
    </Field>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="pointer-events-none absolute top-1/2 right-3 size-2.5 -translate-y-1/2 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 4.5 6 8.5 10 4.5" />
    </svg>
  );
}
