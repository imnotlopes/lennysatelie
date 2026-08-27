import type { ReactNode } from "react";
import { TextoEmPalavras } from "@/components/efeitos/titulo-revelado";
import { cn } from "@/lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "xl"
  | "lg"
  | "sm";

/**
 * Os tamanhos `display-*` usam a Cormorant e servem a título editorial.
 * Os demais usam a Karla e seguem a escala discreta da referência, onde o
 * `h1` tem 21px e o peso visual fica todo na fotografia.
 */
const sizes: Record<HeadingSize, string> = {
  "display-lg": "font-display text-display-lg leading-tight tracking-default",
  "display-md": "font-display text-display-md leading-tight tracking-default",
  "display-sm": "font-display text-display-sm leading-tight tracking-default",
  xl: "font-sans text-xl leading-tight tracking-default",
  lg: "font-sans text-lg leading-tight tracking-default",
  sm: "font-sans text-sm leading-tight tracking-wide",
};

const defaultSizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: "display-md",
  2: "display-sm",
  3: "xl",
  4: "sm",
};

export interface HeadingProps {
  /** Nível semântico. Escolha pela estrutura da página, não pelo tamanho. */
  as?: HeadingLevel;
  /** Tamanho visual. Quando omitido, deriva do nível. */
  size?: HeadingSize;
  /**
   * Revela palavra por palavra quando o título entra na tela.
   *
   * Só funciona com texto puro: com elemento dentro não há como quebrar sem
   * destruir a marcação, e nesse caso o título aparece normal.
   */
  revelar?: boolean;
  className?: string;
  children: ReactNode;
}

export function Heading({
  as = 2,
  size,
  revelar = false,
  className,
  children,
}: HeadingProps) {
  const Tag = `h${as}` as const;
  const resolved = size ?? defaultSizeByLevel[as];
  const quebravel = revelar && typeof children === "string";

  return (
    <Tag
      {...(quebravel
        ? {
            "data-revelar": "palavras",
            // O observador escreve `data-visivel` neste no depois da
            // montagem. Sem isto o React acusa divergencia de hidratacao ao
            // hidratar trechos que chegam depois, porque encontra um atributo
            // que ele nao renderizou.
            suppressHydrationWarning: true,
          }
        : {})}
      className={cn("text-ink text-balance", sizes[resolved], className)}
    >
      {quebravel ? <TextoEmPalavras texto={children} /> : children}
    </Tag>
  );
}
