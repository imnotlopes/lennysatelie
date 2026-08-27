export interface Depoimento {
  nome: string;
  instagram: string;
  citacao: string;
  /** Caminho da foto no bucket, ou vazio para usar o placeholder. */
  foto?: string;
}

/**
 * Depoimentos exibidos na home e na página de produto.
 *
 * ATENÇÃO: os quatro abaixo são PROVISÓRIOS — nomes e textos foram escritos
 * durante a construção do site, não vieram de clientes reais. Precisam sair
 * antes de o site ir ao ar.
 *
 * Substitua por depoimentos de verdade, com autorização de quem falou. A
 * seção se esconde sozinha quando a lista está vazia, então apagar tudo aqui
 * é uma saída segura enquanto os reais não chegam.
 */
export const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Mariana Costa",
    instagram: "@maricosta",
    citacao:
      "Fui madrinha de um casamento na praia e achei o vestido perfeito. O ajuste ficou impecável.",
  },
  {
    nome: "Juliana Ramos",
    instagram: "@juliaramos",
    citacao:
      "Atendimento tranquilo, sem pressa nenhuma. Provei uns seis vestidos até achar o meu.",
  },
  {
    nome: "Fernanda Lima",
    instagram: "@fernandalima",
    citacao:
      "Aluguei à distância, recebi em casa e serviu de primeira. Voltaria com certeza.",
  },
  {
    nome: "Grécia Alves",
    instagram: "@greciaalves",
    citacao:
      "A peça chegou passada e pronta para usar. Devolvi no dia seguinte e ninguém me cobrou nada extra.",
  },
];
