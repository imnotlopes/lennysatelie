import type { CupomPublico, Produto } from "@/lib/supabase/types";

export interface PrecoCalculado {
  /** O que a peça custa sem cupom. `null` quando é sob consulta. */
  original: number | null;
  /** O que a cliente paga. Igual ao original quando não há cupom. */
  final: number | null;
  /** Quanto o cupom abateu, em reais. Zero quando não há desconto. */
  desconto: number;
  temDesconto: boolean;
  /** Valor cheio da promoção da própria peça, para exibir riscado. */
  promocionalDe: number | null;
}

/**
 * Preço de uma peça, já considerando o cupom ativo.
 *
 * É a única função do projeto que calcula desconto. Nenhum componente deve
 * multiplicar ou subtrair preço por conta própria — se a regra mudar (cupom
 * cumulativo, desconto por categoria), muda aqui e vale para o site inteiro.
 *
 * Duas coisas separadas convivem aqui:
 * - `promocionalDe`: a promoção da própria peça, cadastrada no painel
 * - `desconto`: o abatimento do cupom de influenciadora, sobre o preço já
 *   promocional
 */
export function calcularPreco(
  produto: Pick<Produto, "preco_locacao" | "preco_original">,
  cupom?: CupomPublico | null,
): PrecoCalculado {
  const original = produto.preco_locacao;

  // Sob consulta: não há o que descontar.
  if (original === null) {
    return {
      original: null,
      final: null,
      desconto: 0,
      temDesconto: false,
      promocionalDe: null,
    };
  }

  const promocionalDe =
    produto.preco_original !== null && produto.preco_original > original
      ? produto.preco_original
      : null;

  if (!cupom) {
    return {
      original,
      final: original,
      desconto: 0,
      temDesconto: false,
      promocionalDe,
    };
  }

  const bruto =
    cupom.tipo_desconto === "percentual"
      ? (original * cupom.valor) / 100
      : cupom.valor;

  // Nunca deixa o preço ficar negativo, e arredonda para centavos.
  const desconto = Math.min(Math.round(bruto * 100) / 100, original);
  const final = Math.round((original - desconto) * 100) / 100;

  return {
    original,
    final,
    desconto,
    temDesconto: desconto > 0,
    promocionalDe,
  };
}
