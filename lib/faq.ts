export interface Pergunta {
  /** Vira âncora na URL. Só letras minúsculas e hífen. */
  id: string;
  pergunta: string;
  /** Cada item é um parágrafo. */
  resposta: string[];
}

export interface GrupoFaq {
  titulo: string;
  perguntas: Pergunta[];
}

/**
 * Perguntas frequentes, respondidas pela própria Lennys.
 *
 * Tudo aqui veio dela por escrito. Nada foi inventado: quando a resposta não
 * existe, a pergunta não entra — melhor não responder do que prometer o que o
 * ateliê não confirmou.
 *
 * Os emojis do texto original saíram, por regra do projeto.
 */
export const FAQ: GrupoFaq[] = [
  {
    titulo: "Antes de vir",
    perguntas: [
      {
        id: "agendamento",
        pergunta: "Preciso agendar para provar?",
        resposta: [
          "Sim. Com agendamento você garante o seu horário e tem um atendimento mais dedicado, sem dividir a atenção com outra cliente.",
        ],
      },
      {
        id: "horario",
        pergunta: "Qual o horário de funcionamento?",
        resposta: [
          "De segunda a sexta, das 10h às 18h30. Aos sábados, das 10h às 15h.",
        ],
      },
      {
        id: "confeccao",
        pergunta: "Os vestidos são feitos por vocês?",
        resposta: [
          "São. Os nossos vestidos foram feitos inteiramente por nós, cada detalhe e cada ponto.",
          "Isso vale para o acervo inteiro: a peça que você provar aqui saiu da nossa confecção.",
        ],
      },
      {
        id: "tamanhos",
        pergunta: "Quais tamanhos vocês atendem?",
        resposta: [
          "Temos peças do PP ao plus size. Também fazemos confecção sob medida, para o seu vestido dos sonhos no seu tamanho exato.",
        ],
      },
      {
        id: "compra",
        pergunta: "Vocês vendem os vestidos ou só alugam?",
        resposta: [
          "Trabalhamos com aluguel. Como somos nós que confeccionamos, a compra pode ser combinada no caso do vestido feito sob medida.",
        ],
      },
    ],
  },
  {
    titulo: "Reserva e pagamento",
    perguntas: [
      {
        id: "reserva",
        pergunta: "Como faço para reservar um vestido?",
        resposta: [
          "Para reservar o seu vestido, ou para guardarmos a vaga e iniciarmos a compra do tecido no caso do sob medida, pedimos 40% do valor total. Aceitamos débito, crédito, dinheiro ou pix.",
          "Os outros 60% recebemos até a data da retirada do vestido. Podem ser parcelados via pix, mês a mês, ou pagos na retirada em dinheiro, débito ou crédito, parcelando em até 3 vezes sem juros no cartão.",
        ],
      },
      {
        id: "contrato",
        pergunta: "Que informações vocês pedem para o contrato?",
        resposta: [
          "Nome completo, CPF, telefone, endereço, cidade e CEP. Além disso, a data do evento e o nome de quem vai usar a peça, ou o tipo de evento.",
          "Esses dados são combinados no WhatsApp ou no ateliê, no momento de fechar. O site não coleta nenhum deles.",
        ],
      },
    ],
  },
  {
    titulo: "Prazo e devolução",
    perguntas: [
      {
        id: "prazo",
        pergunta: "Por quantos dias fico com o vestido?",
        resposta: [
          "O aluguel tem duração de 3 dias para vestidos prontos e 4 dias para vestidos sob medida.",
        ],
      },
      {
        id: "devolucao",
        pergunta: "Como funciona a devolução?",
        resposta: [
          "Você não precisa lavar nem passar. Toda a higienização profissional fica por nossa conta.",
          "A devolução pode ser feita pessoalmente no ateliê ou, se for mais cômodo, por motoboy ou envio.",
        ],
      },
      {
        id: "atraso",
        pergunta: "E se eu atrasar a devolução?",
        resposta: [
          "Atraso na devolução sem aviso prévio está sujeito a multa de 10% sobre o valor da peça.",
        ],
      },
      {
        id: "dano",
        pergunta: "E se o vestido rasgar ou manchar?",
        resposta: [
          "Caso a peça retorne rasgada ou manchada, é cobrada uma taxa de 30% sobre o valor dela.",
        ],
      },
    ],
  },
  {
    titulo: "Para quem mora longe",
    perguntas: [
      {
        id: "distancia",
        pergunta: "Vocês atendem quem mora em outra cidade ou país?",
        resposta: [
          "Sim. Já atendemos clientes cujos vestidos foram usados na Bahia, em Pernambuco, no Piauí, no Pará, e também no Peru, no Chile, no Canadá e nos Estados Unidos.",
          "Vale saber que a maioria dessas clientes teve pelo menos um contato presencial, para garantir o ajuste perfeito. Por isso, endereço e contato corretos são essenciais, e a conversa começa sempre pelo WhatsApp.",
        ],
      },
    ],
  },
];
