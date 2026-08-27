import type { ComponentType, SVGProps } from "react";
import {
  IconeAgenda,
  IconeAjustes,
  IconeCabide,
  IconeDevolucao,
  IconeFesta,
  IconeReserva,
} from "@/components/icons";

/**
 * Os seis passos do atendimento, escritos pela Lennys.
 *
 * Fonte única: a home mostra a versão curta e a página `/como-funciona` a
 * completa, das mesmas linhas. Quando ela mudar uma regra, muda aqui e vale
 * nos dois lugares — antes o texto da home era meu e já divergia da realidade
 * (dizia devolução em dois dias; o prazo é de três).
 */

/** Para onde o passo leva. O link do WhatsApp é montado na hora de renderizar. */
export type DestinoPasso = "whatsapp" | "acervo" | "instagram" | "devolucao";

export interface Passo {
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  /** Nome do passo. Sempre no imperativo, para os seis ficarem paralelos. */
  titulo: string;
  /** A frase de efeito que a Lennys escreveu para alguns passos. */
  chamada?: string;
  /** Versão curta, para a home. */
  resumo: string;
  /** Texto completo, para a página. */
  texto: string;
  acao: {
    rotulo: string;
    destino: DestinoPasso;
    /**
     * Só dois passos têm botão. Seis chamadas seguidas competem entre si e
     * nenhuma vence; as outras quatro são link de texto.
     */
    principal?: boolean;
  };
}

export const PASSOS: Passo[] = [
  {
    icone: IconeAgenda,
    titulo: "Agende uma visita",
    resumo:
      "Horário marcado, atendimento só para você, sem pressa.",
    texto:
      "Acreditamos que a escolha do vestido perfeito merece atenção plena. Por isso o agendamento faz toda a diferença no seu atendimento, com horário marcado para receber você com a exclusividade, a calma e o carinho que o seu momento exige.",
    acao: { rotulo: "Agendar meu horário", destino: "whatsapp", principal: true },
  },
  {
    icone: IconeCabide,
    titulo: "Encontre seu vestido",
    resumo:
      "Separe aqui pelo site as peças que você quer provar na visita.",
    texto:
      "Explore aqui pelo site a nossa curadoria de vestidos de festa e de noiva, e separe os modelos que mais encantam o seu coração. Fazendo isso, eles já estarão separados e prontos para você provar na sua visita ao ateliê.",
    // Rotulo encurtado: o dela era "Conhecer vestidos disponiveis no site", que
    // quebra em duas linhas dentro do botao no celular.
    acao: { rotulo: "Conhecer os vestidos", destino: "acervo", principal: true },
  },
  {
    icone: IconeReserva,
    titulo: "Faça a sua reserva",
    chamada: "Garanta o seu vestido dos sonhos",
    resumo:
      "O sinal de 40% guarda a peça para a data da sua celebração.",
    texto:
      "Encontrou o vestido ideal? Para assegurar exclusividade e reservar a peça com segurança para a data da sua celebração, basta efetuar o sinal de 40% do valor da locação.",
    acao: { rotulo: "Reservar meu vestido", destino: "acervo" },
  },
  {
    icone: IconeAjustes,
    titulo: "Marque seus ajustes",
    chamada: "Prova e ajustes sob medida",
    resumo:
      "Uma semana antes do evento, a peça é ajustada no seu corpo.",
    texto:
      "Nosso compromisso é que você se sinta deslumbrante e confortável. Uma semana antes do seu evento, agende a sua prova para a marcação dos ajustes.",
    acao: { rotulo: "Agendar ajustes", destino: "whatsapp" },
  },
  {
    icone: IconeFesta,
    titulo: "Viva esse dia único",
    resumo: "Aproveite cada segundo da sua festa.",
    texto:
      "Brilhe muito, aproveite cada segundo da sua festa com confiança e sinta-se radiante. E não se esqueça de registrar os melhores momentos e nos marcar, para celebrarmos juntas.",
    acao: { rotulo: "Inspirações no Instagram", destino: "instagram" },
  },
  {
    icone: IconeDevolucao,
    titulo: "Devolução tranquila",
    resumo:
      "A higienização é por nossa conta. Devolva no ateliê ou por envio.",
    texto:
      "Depois da celebração, relaxe: você não precisa se preocupar com a limpeza, porque todo o processo de higienização profissional fica inteiramente por nossa conta. A devolução pode ser feita pessoalmente no ateliê ou, com total comodidade, por motoboy ou envio.",
    acao: { rotulo: "Saber mais sobre a devolução", destino: "devolucao" },
  },
];
