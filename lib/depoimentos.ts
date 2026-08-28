/**
 * Depoimentos de clientes do ateliê.
 *
 * TODOS OS TEXTOS ABAIXO SÃO REAIS, transcritos das conversas de WhatsApp e
 * Instagram que a Lennys enviou. Substituíram quatro que eu havia inventado
 * durante a construção do site.
 *
 * Transcrição fiel, com três ajustes de forma e nenhum de conteúdo:
 *   - emojis removidos, por regra do projeto
 *   - pontuação e acentuação corrigidas onde faltavam ("agradeçooo", "voces")
 *   - mensagens seguidas da mesma pessoa unidas num parágrafo só
 *
 * FALTA ANTES DE PUBLICAR:
 *   1. Autorização de cada cliente. Mensagem particular virando conteúdo
 *      público precisa do sim de quem escreveu — não basta o ateliê ter
 *      recebido.
 *   2. O primeiro nome de cada uma. Não invento nome de pessoa real: por
 *      enquanto `nome` está nulo e a interface mostra a atribuição genérica.
 */

export interface Depoimento {
  /** Primeiro nome. Nulo enquanto a Lennys não confirmar quem é quem. */
  nome: string | null;
  instagram?: string;
  citacao: string;
  /** Ocasião, quando dá para saber pelo contexto. Ajuda a cliente a se ver. */
  ocasiao?: string;
}

/** Relatos escritos, sem foto. */
export const DEPOIMENTOS_ESCRITOS: Depoimento[] = [
  {
    nome: null,
    citacao:
      "Eu que agradeço, o vestido ficou impecável. O trabalho de vocês estava maravilhoso, muito obrigada pelo apoio e pela ajuda nos mínimos detalhes.",
  },
  {
    nome: null,
    citacao:
      "Pessoal, muito obrigada! De verdade, com toda certeza recomendo muito o trabalho de vocês.",
  },
  {
    nome: null,
    citacao:
      "Amei conhecê-los. Se precisar de novo, corro aí, e vou indicar também.",
  },
  {
    nome: null,
    citacao:
      "Passando para deixar meu feedback. Eu realmente fiquei apaixonada nesse vestido lindo de vocês. Superou as minhas expectativas. Agradeço pelo atendimento maravilhoso, pelo carinho e principalmente pelo look incrível que aluguei com vocês. Recomendo demais o trabalho de vocês, e já estou ansiosa para arrasar novamente com os vestidos perfeitos do seu ateliê.",
  },
  {
    nome: null,
    citacao:
      "Eu me senti linda, do começo ao fim da festa. Eu não queria tirar o vestido! Não tenho palavras para mensurar a gratidão que eu tenho pelo que vocês fizeram. Ficou impecável.",
  },
  {
    nome: null,
    citacao:
      "Oi, meninas. Eu que tenho que agradecer: foi mágico, exatamente como sonhei. Meu vestido estava deslumbrante. Muito obrigada de coração. Vocês foram incríveis. Até no meu momento de desespero vocês tiveram jogo de cintura.",
  },
  {
    nome: null,
    citacao:
      "Vocês têm um talento especial e são muito atenciosas. Me senti muito bonita no vestido de vocês, muito obrigada.",
  },
  {
    nome: null,
    citacao:
      "Ficou melhor do que eu imaginei. O trabalho e o atendimento de vocês é perfeito: a paciência, o cuidado e o talento. Vocês trabalham com sonhos.",
  },
  {
    nome: null,
    citacao:
      "As pessoas só sabiam falar do vestido. Foi o destaque da festa.",
  },
  {
    nome: null,
    citacao:
      "Todos elogiaram meu vestido. Me senti super linda.",
  },
  {
    nome: null,
    citacao:
      "Confio de olhos fechados em vocês daqui em diante. Claramente voltarei a alugar muitos outros looks mais vezes. Deus abençoe grandemente a vida de vocês e o trabalho impecável.",
  },
];
