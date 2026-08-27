/** Formatação de valores para a interface, sempre em pt-BR. */

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata o preço de locação. Ex.: 380 vira "R$ 380,00". */
export function precoBRL(valor: number): string {
  return BRL.format(valor);
}

/**
 * "2026-10-12" vira "12/10/2026".
 *
 * Sem passar por `new Date()` de propósito: o construtor interpreta a string
 * curta como UTC e desloca um dia para trás em fuso negativo — a data que a
 * cliente escolheu apareceria errada para ela mesma.
 */
export function dataBR(iso: string): string {
  const partes = iso.split("-");
  if (partes.length !== 3) return iso;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Que dia é hoje em Jandira, no formato curto do banco ("2026-10-12").
 *
 * O fuso é fixado de propósito. O servidor da Vercel roda em UTC: sem isso,
 * das 21h à meia-noite o site já acharia que virou o dia e um cupom que vale
 * até hoje pararia de funcionar três horas antes da hora.
 *
 * `en-CA` é o atalho conhecido para ano-mês-dia com zero à esquerda.
 */
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}
