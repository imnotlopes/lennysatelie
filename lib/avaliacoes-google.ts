/**
 * Avaliações do perfil do ateliê no Google.
 *
 * TODOS OS TEXTOS ABAIXO SÃO REAIS, lidos do perfil em 11/09/2026. Nada foi
 * escrito por mim: o que está aqui foi copiado da página e conferido contra
 * ela. Nome e data são exatamente os que o Google mostra, inclusive quando a
 * pessoa escreveu o próprio nome em minúsculas.
 *
 * POR QUE FICA NO CÓDIGO, E NÃO NUMA API
 * --------------------------------------
 * A Places API do Google devolve no máximo 5 avaliações, cobra por chamada e
 * exige chave com faturamento ativo. Para uma nota que muda de mês em mês,
 * sai caro e entrega o mesmo que está aqui. Quando o número subir bastante,
 * atualiza-se a constante `RESUMO` — é uma linha.
 *
 * O QUE NÃO FAZEMOS COM ESTES DADOS
 * ---------------------------------
 * Não vão para `aggregateRating` nos dados estruturados. A política do Google
 * proíbe marcar como sua a avaliação coletada em outro site, e a punição é
 * manual. Mostrar para a visitante é livre; declarar para o robô, não.
 *
 * TRANSCRIÇÃO
 * -----------
 * Fiel, com ajustes só de forma e nenhum de conteúdo: emojis removidos por
 * regra do projeto, espaço antes de vírgula corrigido, quebras de linha e
 * pontuação repetida ("....", "!!!!") reduzidas a uma. A grafia de cada
 * pessoa foi mantida como ela escreveu, concordância inclusive — é a voz
 * dela, e corrigir soaria como texto de agência.
 *
 * POR QUE SÃO CINCO, E POR QUE TODAS TÊM NOME
 * -------------------------------------------
 * São 132 avaliações, e apenas estas cinco vieram com texto: o Google corta o
 * carregamento da lista para quem não está logado na conta do perfil.
 *
 * Uma versão anterior tinha mais três, colhidas sem autoria, que apareciam no
 * site assinadas como "Cliente do ateliê". Foram removidas. Depoimento sem
 * nome não prova nada — quem lê supõe que o dono do site escreveu — e ao lado
 * de avaliações com nome e foto de perfil, ele derruba a credibilidade das
 * verdadeiras junto. Cinco com nome valem mais que oito com três anônimas.
 *
 * Por isso `nome` e `quando` não são opcionais: o tipo impede que uma entrada
 * sem autoria entre aqui de novo por descuido.
 *
 * Quando a Lennys mandar o resto, é só continuar a lista.
 */

export interface AvaliacaoGoogle {
  /** Como o Google mostra, letra por letra. */
  nome: string;
  /** "6 meses atrás", como na página. */
  quando: string;
  /** De 1 a 5. Das 132, o Google contabiliza 131 com cinco estrelas. */
  nota: number;
  texto: string;
}

/** Perfil no Google Maps. Abre a lista completa. */
export const PERFIL_GOOGLE =
  "https://www.google.com/maps?cid=16962838696759344477";

/** Nota e volume do perfil. Conferidos em 11/09/2026. */
export const RESUMO = {
  nota: 5,
  /** Como se escreve em português. Evita `toFixed` e vírgula na renderização. */
  notaEscrita: "5,0",
  total: 132,
} as const;

/** Da mais recente para a mais antiga, como o Google lista por padrão. */
export const AVALIACOES_GOOGLE: AvaliacaoGoogle[] = [
  {
    nome: "Giselly",
    quando: "4 meses atrás",
    nota: 5,
    texto:
      "Muito bem recepcionada. Lugar organizado e excelente profissionais, cumprem e entregam o que a gente almeija. Muitas opções de roupas para madrinhas e noivas, inclusive fazem primeiro aluguel sobre medidas que foi o meu caso. Fiquei impressionada na entrega pq havia provado somente o molde do vestido e no dia da retirada peguei ele todo pronto perfeito. Só foi feito a barra e detalhe de manga na hora. Fiz sucesso na festa e já indiquei várias outras pessoas. Só nesse evento foi alugado dois vestidos de madrinhas, um terno e um vestido de noiva. Todos ficamos muito satisfeito. Deus abençoe, indico sem medo.",
  },
  {
    nome: "Angelica Vicari",
    quando: "6 meses atrás",
    nota: 5,
    texto:
      "Lá elas não alugam apenas vestido, junto vem a elegância, sofisticação e muita beleza. Os detalhes de cada peça são perfeitos. Eu super recomendo pra todos.",
  },
  {
    nome: "thalita isidio",
    quando: "7 meses atrás",
    nota: 5,
    texto:
      "Experiência incrível, atendimento, atenção, acolhimento. Olha, dificilmente encontramos profissionais assim, fazem tudo com muito amor e dedicação. Toda minha família amou. Meu vestido em especial, feito sob medida, ficou incrível, só elogios. Super recomendo, obrigada.",
  },
  {
    nome: "emily da silva pereira",
    quando: "8 meses atrás",
    nota: 5,
    texto:
      "Não tenho palavras para agradecer vocês. Foram uns anjos na minha vida. Quando estava desesperada atrás do meu vestido, vocês apareceu na minha vida e me deu tranquilidade e paz! O vestido de noiva foi um arraso, muito além das minhas expectativas. TODOS elogiaram! Indico e indicarei vocês de olhos fechados! Deus abençoe por tudo.",
  },
  {
    nome: "Idaiane Andrade",
    quando: "11 meses atrás",
    nota: 5,
    texto:
      "Já é minha segunda vez alugando com essas maravilhosas, e não tenho o que reclamar, elas são super atenciosas, uma benção. Super indico se você procura aquele lindo vestido para casamento, madrinha, debutante ou outras ocasiões, com certeza aqui você encontra. Que Deus abençoe grandemente a vida dessas moças maravilhosas.",
  },
];

/**
 * Primeira letra do nome, para o círculo do avatar.
 *
 * A foto de perfil do Google não é usada de propósito: ela quebra quando a
 * pessoa troca a dela, e carregar imagem de servidor do Google em toda visita
 * contradiz a página de privacidade, que hoje declara o mapa como a única
 * coisa de terceiro no site. O círculo com a inicial é o mesmo recurso que o
 * próprio Google usa para quem não tem foto.
 */
export function inicialDe(nome: string): string {
  return nome.trim().charAt(0).toUpperCase();
}
