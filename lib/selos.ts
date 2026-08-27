import type { ComponentType, SVGProps } from "react";
import {
  IconeAgenda,
  IconeAjustes,
  IconeDevolucao,
  IconeWhatsapp,
} from "@/components/icons";

export interface Selo {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  detalhe: string;
}

/**
 * Selos de confiança da página de produto.
 *
 * Três dos quatro foram confirmados pela Lennys por escrito: prova com hora
 * marcada, devolução sem lavar e atendimento a distância (este último
 * reescrito, porque o meu texto prometia mais do que ela faz).
 *
 * FALTA CONFIRMAR: o de ajuste não diz se está incluso no valor da locação ou
 * se é cobrado à parte. Enquanto ela não responder, o texto fala só do que é
 * certo — que a peça é ajustada — sem afirmar que é de graça.
 */
export const SELOS: Selo[] = [
  {
    icone: IconeAgenda,
    titulo: "Prova com hora marcada",
    detalhe: "Atendimento individual, sem fila e sem pressa.",
  },
  {
    icone: IconeAjustes,
    titulo: "Ajuste no seu corpo",
    detalhe: "Uma semana antes do evento, a peça é ajustada em você.",
  },
  {
    icone: IconeDevolucao,
    titulo: "Devolução sem lavar",
    detalhe: "Traga como está. Da higienização cuidamos nós.",
  },
  {
    icone: IconeWhatsapp,
    titulo: "Atendemos quem mora longe",
    // O texto anterior era meu e prometia demais ("a gente envia", como se
    // bastasse pedir). A Lennys esclareceu que a maioria das clientes de fora
    // teve pelo menos um contato presencial para o ajuste sair certo.
    detalhe: "Já vestimos noivas de outros estados e países. Combine pelo WhatsApp.",
  },
];
