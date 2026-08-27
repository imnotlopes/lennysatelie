import { precoBRL } from "@/lib/format";
import { calcularPreco } from "@/lib/preco";
import type { CupomPublico, Produto } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface PrecoProps {
  produto: Pick<Produto, "preco_locacao" | "preco_original">;
  /** Cupom ativo da visitante. Sem ele, mostra o preço cheio. */
  cupom?: CupomPublico | null;
  /** `sm` na grade, `lg` na página do produto. */
  tamanho?: "sm" | "lg";
  className?: string;
}

/**
 * Único componente de exibição de preço do projeto.
 *
 * Não calcula nada: delega a `calcularPreco`. Cobre três situações que se
 * sobrepõem — sob consulta, promoção da própria peça e cupom de
 * influenciadora — e o valor riscado é sempre o que a cliente deixou de pagar.
 */
export function Preco({
  produto,
  cupom,
  tamanho = "sm",
  className,
}: PrecoProps) {
  const escala = tamanho === "lg" ? "text-lg" : "text-xs";
  const { original, final, temDesconto, promocionalDe } = calcularPreco(
    produto,
    cupom,
  );

  if (final === null || original === null) {
    return (
      <span className={cn(escala, "text-ink-muted", className)}>
        Sob consulta
      </span>
    );
  }

  // Com cupom, risca o preço de tabela. Sem cupom, risca o valor cheio da
  // promoção da peça, quando houver. Nunca os dois: dois valores riscados
  // lado a lado só confundem.
  const riscado = temDesconto ? original : promocionalDe;
  const emDestaque = temDesconto || promocionalDe !== null;

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn(escala, emDestaque ? "text-accent-ink" : "text-ink")}>
        {precoBRL(final)}
      </span>

      {riscado !== null ? (
        <span className="text-2xs text-ink-faded line-through">
          {precoBRL(riscado)}
          <span className="sr-only"> era o preço anterior</span>
        </span>
      ) : null}
    </span>
  );
}
