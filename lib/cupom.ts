import { dataBR, hojeISO } from "@/lib/format";
import type { CupomPublico } from "@/lib/supabase/types";

/** Nome do cookie que guarda o código do cupom ativo. */
export const COOKIE_CUPOM = "lennys_cupom";

/** 30 dias, como pedido. */
export const CUPOM_MAX_AGE = 60 * 60 * 24 * 30;

/** O mínimo que se precisa saber de um cupom para julgar se ele vale. */
export interface PeriodoCupom {
  ativo: boolean;
  inicio: string | null;
  validade: string | null;
  limite_usos: number | null;
  usos: number;
}

export type EstadoCupom =
  | "valendo"
  | "agendado"
  | "vencido"
  | "esgotado"
  | "desligado";

export interface SituacaoCupom {
  estado: EstadoCupom;
  /** Uma palavra, para a coluna da tabela. */
  rotulo: string;
  /** A explicação, quando existe algo a explicar. */
  detalhe: string | null;
}

/**
 * Em que pé está um cupom.
 *
 * A ordem das checagens não é arbitrária. Vencido e esgotado vêm antes de
 * desligado porque são definitivos: se a dona vir "Desligado" num cupom que
 * também venceu, ela liga a chave e continua sem funcionar, sem entender por
 * quê. O primeiro motivo mostrado precisa ser o que ela não consegue desfazer.
 */
export function situacaoCupom(cupom: PeriodoCupom): SituacaoCupom {
  const hoje = hojeISO();

  if (cupom.validade && cupom.validade < hoje) {
    return {
      estado: "vencido",
      rotulo: "Vencido",
      detalhe: `Venceu em ${dataBR(cupom.validade)}`,
    };
  }

  if (cupom.limite_usos !== null && cupom.usos >= cupom.limite_usos) {
    return {
      estado: "esgotado",
      rotulo: "Esgotado",
      detalhe: `Chegou ao limite de ${cupom.limite_usos}`,
    };
  }

  if (!cupom.ativo) {
    return {
      estado: "desligado",
      rotulo: "Desligado",
      detalhe: "O link abre o site, mas não dá desconto",
    };
  }

  if (cupom.inicio && cupom.inicio > hoje) {
    return {
      estado: "agendado",
      rotulo: "Agendado",
      detalhe: `Começa em ${dataBR(cupom.inicio)}`,
    };
  }

  return {
    estado: "valendo",
    rotulo: "Valendo",
    detalhe: cupom.validade ? `Até ${dataBR(cupom.validade)}` : null,
  };
}

/**
 * Um cupom só vale quando está ligado, dentro do período e abaixo do limite.
 *
 * A RLS já derruba o inválido na consulta pública, mas a checagem fica aqui
 * também porque o middleware e o painel (autenticado) leem a tabela por
 * caminhos diferentes — e o painel enxerga tudo.
 */
export function cupomEhValido(cupom: PeriodoCupom): boolean {
  return situacaoCupom(cupom).estado === "valendo";
}

/** "10%" ou "R$ 50,00", conforme o tipo. Para o texto do banner. */
export function descontoLegivel(
  cupom: Pick<CupomPublico, "tipo_desconto" | "valor">,
): string {
  if (cupom.tipo_desconto === "percentual") {
    // Sem casas decimais quando for inteiro: "10%" e não "10,00%".
    const valor = Number.isInteger(cupom.valor)
      ? String(cupom.valor)
      : cupom.valor.toFixed(1).replace(".", ",");
    return `${valor}%`;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cupom.valor);
}
