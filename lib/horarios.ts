/**
 * Horário de atendimento do ateliê. Fonte única.
 *
 * Existia em três lugares e dois estavam errados: a página de contato dizia
 * 10h às 18h30, e tanto os dados estruturados quanto o cartão do mapa diziam
 * 09h às 18h. O da página de contato é o que a Lennys informou.
 *
 * Os dados estruturados são o caso grave dos três: é deles que o Google tira
 * o horário mostrado no resultado de busca. Uma cliente que confiasse naquele
 * "09h" chegaria uma hora antes de abrir.
 *
 * Por isso mora aqui, em dois formatos a partir dos mesmos números: o que a
 * visitante lê e o que a máquina lê. Mudar num lugar muda nos dois.
 *
 * Quando a dona precisar editar sozinha, isto vira campo do painel — hoje ela
 * não pediu, e um campo a mais no painel sem necessidade é um campo a mais
 * para preencher errado.
 */

export interface FaixaDeHorario {
  /** Como aparece para a visitante. */
  dias: string;
  horas: string;
  /** Como o schema.org espera, ou `null` quando é dia fechado. */
  schema: { dias: string[]; abre: string; fecha: string } | null;
}

export const HORARIOS: FaixaDeHorario[] = [
  {
    dias: "Segunda a sexta",
    horas: "10h às 18h30",
    schema: {
      dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      abre: "10:00",
      fecha: "18:30",
    },
  },
  {
    dias: "Sábado",
    horas: "10h às 15h",
    schema: { dias: ["Saturday"], abre: "10:00", fecha: "15:00" },
  },
  {
    dias: "Domingo",
    horas: "Fechado",
    // Dia fechado não entra nos dados estruturados: a ausência já diz isso, e
    // declarar um intervalo vazio confunde o Google.
    schema: null,
  },
];

/** As faixas no formato que o schema.org espera. */
export function horariosParaSchema() {
  return HORARIOS.filter((h) => h.schema !== null).map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.schema!.dias,
    opens: h.schema!.abre,
    closes: h.schema!.fecha,
  }));
}
