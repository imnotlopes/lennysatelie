/**
 * Amostra visual de cada cor do acervo.
 *
 * O nome da cor é texto livre no banco, escrito pela dona do ateliê. Este mapa
 * traduz os nomes conhecidos para um hex de swatch; nome desconhecido cai num
 * cinza neutro em vez de sumir da lista de filtros.
 *
 * Ao cadastrar uma cor nova no painel, acrescente a entrada aqui.
 */
const MAPA: Record<string, string> = {
  branco: "#ffffff",
  "off white": "#f3ede7",
  ros: "#e7c9c2",
  rose: "#e7c9c2",
  "azul serenity": "#a8c2e0",
  "azul claro": "#b9d0e8",
  "azul royal": "#2f4fa8",
  "azul marinho": "#1b2545",
  preto: "#1a1a1a",
  vermelho: "#a51f2d",
  verde: "#3f6b52",
  dourado: "#c2a469",
  prata: "#c9c9c9",
  nude: "#e2cdbb",
};

const NEUTRO = "#d6d0cb";

function normalizar(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Hex do swatch para o nome de cor vindo do banco. */
export function hexDaCor(nome: string): string {
  return MAPA[normalizar(nome)] ?? NEUTRO;
}

/**
 * Cor clara precisa de contorno mais escuro, senão o swatch some sobre o
 * fundo creme do site.
 */
export function corEhClara(nome: string): boolean {
  const hex = hexDaCor(nome).replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  // Luminância relativa aproximada, suficiente para decidir contorno.
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.75;
}
