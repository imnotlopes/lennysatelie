/**
 * Feedbacks de clientes, como o ateliê os recebeu e publicou.
 *
 * São capturas de conversa e artes de story do Instagram do Lennys Ateliê,
 * enviadas pela Shakira. O material chegou pronto, com o texto dentro da
 * imagem — não é texto que dê para editar.
 *
 * Por isso cada item tem `transcricao`: ela vira o `alt` da imagem. É o que
 * um leitor de tela lê, o que o Google indexa e o que aparece se a imagem não
 * carregar. Sem isso a seção seria um bloco mudo para quem não enxerga.
 *
 * As transcrições foram feitas lendo os prints, com emojis removidos e
 * pontuação corrigida. O conteúdo é o que a cliente escreveu.
 */

export interface Feedback {
  /** Caminho em /public. */
  imagem: string;
  /** O que está escrito na imagem. Vira o texto alternativo. */
  transcricao: string;
}

/** Artes de story: a cliente com a peça e o relato na mesma imagem. */
export const FEEDBACKS_COM_IMAGEM: Feedback[] = [
  {
    imagem: "/fotos/feedbacks/imagem-01.webp",
    transcricao:
      "Duas clientes com vestidos azul royal ao ar livre. Mensagem: Obrigado pelo atendimento, super amei.",
  },
  {
    imagem: "/fotos/feedbacks/imagem-02.webp",
    transcricao:
      "Cliente com vestido terracota de manga longa em um casamento. Mensagem: Eu amei. Vocês estão de parabéns.",
  },
  {
    imagem: "/fotos/feedbacks/imagem-03.webp",
    transcricao:
      "Cliente com vestido pink de um ombro só, ao lado do marido. Avaliação de cinco estrelas com a palavra maravilhosa.",
  },
  {
    imagem: "/fotos/feedbacks/imagem-04.webp",
    transcricao:
      "Cliente com vestido marsala de mangas bufantes ao lado de um bolo de casamento. Mensagem: Nós que agradecemos o cuidado, atenção e carinho, e com certeza indicaremos.",
  },
  {
    imagem: "/fotos/feedbacks/imagem-05.webp",
    transcricao:
      "Cliente com vestido verde drapeado em uma recepção. Mensagem: Eu que agradeço, viu, pela recepção, pelo cuidado. Amei.",
  },
  {
    imagem: "/fotos/feedbacks/imagem-06.webp",
    transcricao:
      "Cliente com vestido verde água de manga longa e fenda. Mensagem: Dedicação em cada detalhe. O vestido ficou simplesmente impecável e rendeu muitos elogios. Me senti linda, confortável e muito especial.",
  },
];

/** Capturas de conversa. Relato escrito, sem foto da peça. */
export const FEEDBACKS_POR_MENSAGEM: Feedback[] = [
  {
    imagem: "/fotos/feedbacks/mensagem-01.webp",
    transcricao:
      "Várias mensagens com a palavra elogios em destaque: Amei o vestido e muita gente elogiou. Todo mundo elogiou. O vestido ficou maravilhoso. Eu ganhei muitos elogios. O vestido ficou perfeito e recebemos inúmeros elogios.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-02.webp",
    transcricao:
      "Eu que agradeço, o vestido ficou impecável. O trabalho de vocês estava maravilhoso, muito obrigada pelo apoio e pela ajuda nos mínimos detalhes. Pessoal, muito obrigada! De verdade, com toda certeza recomendo muito o trabalho de vocês. Amei conhecê-los, se precisar de novo corro aí e vou indicar também.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-03.webp",
    transcricao:
      "Bom dia. Quero aqui expressar minha sincera gratidão. Obrigada por fazer esse dia tão especial para a minha filha. O vestido ficou perfeito e recebemos inúmeros elogios. Perfeição. Deus vos abençoe grandemente.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-04.webp",
    transcricao:
      "Fotos de uma noiva com vestido branco ao ar livre. Mensagem: As fotos oficiais chegaram e eu sigo olhando com tanta gratidão por esse vestido. Serei eternamente grata por ter encontrado vocês. Ele ficou digno de referência no Pinterest.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-05.webp",
    transcricao:
      "Obrigada, eu agradeço todo empenho e atenção. Vocês foram importantíssimos na realização desse sonho. Muito atenciosa, Isis, um amor de pessoa, e com delicadeza nos atendeu em cima da hora. E graças a Deus deu tudo certo.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-06.webp",
    transcricao:
      "Obrigada, o atendimento de vocês foi perfeito, o vestido também maravilhoso. Mulher, arrasei no meu vestido, com vocês não tem como dar errado, nunca. Deus abençoe por toda paciência e disponibilidade.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-07.webp",
    transcricao:
      "Ficou maravilhosa. Graças ao trabalho maravilhoso de vocês. Quero agradecer pelo atendimento, por toda atenção recebida. Que Deus abençoe muitíssimo, e eu super indico a loja.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-08.webp",
    transcricao:
      "Quero expressar minha imensa gratidão ao Lennys Ateliê e à Shakira por terem me recebido com tanto carinho e profissionalismo. Desde o primeiro instante me senti acolhida e especial. Vocês realizaram o meu maior sonho: vestir um vestido digno de princesa, exatamente como sempre imaginei. A dedicação, o talento e o amor pelo que fazem transparecem em cada prova, em cada ajuste e em cada conversa. Saio desse processo não apenas com o vestido perfeito, mas com uma experiência inesquecível.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-09.webp",
    transcricao:
      "Não tenho as fotos oficiais ainda, mas essas mostram o quanto estávamos felizes e vocês fizeram parte disso. Eu me senti linda, do começo ao fim da festa. Eu não queria tirar o vestido. Não tenho palavras para mensurar a gratidão que eu tenho pelo que vocês fizeram. Ficou impecável. Vocês me ouviram desde o início e fizeram o vestido do jeitinho que eu pedi.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-10.webp",
    transcricao:
      "Arrasaram demais mais uma vez. Vocês têm um talento especial e são muito atenciosas, me senti muito bonita no vestido de vocês. Oi, meninas, eu que tenho que agradecer: foi mágico, exatamente como sonhei, meu vestido estava deslumbrante. Até no meu momento de desespero vocês tiveram jogo de cintura. Indico sem medo. Elogiaram demais o vestido, falando que estava parecendo de princesa.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-11.webp",
    transcricao:
      "Fotos de noivas e debutantes com os vestidos. Mensagens: Ficou melhor do que eu imaginei, o trabalho e o atendimento de vocês é perfeito, a paciência, o cuidado e o talento. Vocês são simplesmente perfeitas, vocês trabalham com sonhos. As pessoas só sabiam falar do vestido, foi o destaque da festa. Todos elogiaram meu vestido, me senti super linda.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-12.webp",
    transcricao:
      "Foi tudo perfeito, vocês foram incríveis desde o primeiro momento. Eu que agradeço toda paciência, cuidado e dedicação que vocês tiveram, vou me lembrar disso o resto da vida. Sem palavras para agradecer, o vestido ficou impecável, tantos elogios.",
  },
  {
    imagem: "/fotos/feedbacks/mensagem-13.webp",
    transcricao:
      "Cliente com vestido rosa longo em um arco de flores. Mensagem: Confio agora em diante em vocês de olhos fechados. Claramente voltarei a alugar muitos outros looks mais vezes. Deus abençoe grandemente a vida de vocês e o trabalho impecável.",
  },
];

/** Reels do Instagram do ateliê. A miniatura é local; o clique vai para lá. */
export interface Reel {
  /** Miniatura baixada do Instagram. A URL original do CDN expira. */
  capa: string;
  url: string;
  descricao: string;
}

export const REELS: Reel[] = [
  {
    capa: "/fotos/reel-1.webp",
    url: "https://www.instagram.com/reel/DYXlmnzxI3x/",
    descricao: "Vídeo do ateliê no Instagram",
  },
  {
    capa: "/fotos/reel-2.webp",
    url: "https://www.instagram.com/reel/DFik0qSx_N_/",
    descricao: "Vídeo do ateliê no Instagram",
  },
  {
    capa: "/fotos/reel-3.webp",
    url: "https://www.instagram.com/reel/DTv05JqCbck/",
    descricao: "Vídeo do ateliê no Instagram",
  },
  {
    capa: "/fotos/reel-4.webp",
    url: "https://www.instagram.com/reel/DaYs3sopvE5/",
    descricao: "Vídeo do ateliê no Instagram",
  },
];
