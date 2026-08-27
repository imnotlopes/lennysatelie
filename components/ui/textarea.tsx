import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Field, controlBase, controlBorder, describedBy } from "./field";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function Textarea({
  id,
  label,
  error,
  hint,
  rows = 4,
  className,
  wrapperClassName,
  ...props
}: TextareaProps) {
  return (
    <Field
      htmlFor={id}
      label={label}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        rows={rows}
        className={cn(
          controlBase,
          controlBorder(Boolean(error)),
          "resize-y px-3 py-2 leading-base",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </Field>
  );
}
