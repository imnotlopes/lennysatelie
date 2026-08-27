import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  /** Elemento renderizado. Use `section`, `header` ou `footer` quando fizer sentido. */
  as?: ElementType;
  /** Remove o respiro lateral. Para faixas que sangram até a borda da tela. */
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Largura de conteúdo da referência: 1145px, com 20px de respiro lateral no
 * mobile e 60px a partir do desktop.
 */
export function Container({
  as: Component = "div",
  bleed = false,
  className,
  children,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-content",
        !bleed && "px-4 lg:px-12",
        className,
      )}
    >
      {children}
    </Component>
  );
}
