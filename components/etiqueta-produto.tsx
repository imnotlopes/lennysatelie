import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface EtiquetaProdutoProps {
  /** O que a dona escreveu no painel. Nulo ou em branco não rende nada. */
  texto: string | null | undefined;
  className?: string;
}

/**
 * A etiqueta da peça: "Novidade", "Promoção", "Última peça".
 *
 * O texto é livre e sai do painel — não é lista fechada no código, porque quem
 * escreve é a dona do ateliê.
 *
 * POR QUE É UM COMPONENTE, E NÃO DUAS CLASSES IGUAIS
 * -------------------------------------------------
 * Ela aparece em dois lugares: no card do acervo, sobre a foto, e na página da
 * peça. Precisam ser idênticas — quem clica num card marcado "Promoção" tem de
 * reconhecer a mesma marca ao chegar, senão parece outra coisa.
 *
 * Enquanto o estilo estava escrito à mão só no card, a página da peça
 * simplesmente não mostrava a etiqueta: a informação existia no banco e sumia
 * no clique. Com um componente só, acrescentar um terceiro lugar não repete o
 * erro.
 */
export function EtiquetaProduto({ texto, className }: EtiquetaProdutoProps) {
  const limpo = texto?.trim();
  if (!limpo) return null;

  return (
    <Badge variant="ink" className={cn("px-3 py-1.5", className)}>
      {limpo}
    </Badge>
  );
}
