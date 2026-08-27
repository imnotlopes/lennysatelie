import { dataBR, precoBRL } from "@/lib/format";
import { calcularPreco } from "@/lib/preco";
import type { CupomPublico, ProdutoComCategoria } from "@/lib/supabase/types";

/**
 * Montagem do link e da mensagem do WhatsApp.
 *
 * Este arquivo é o único lugar do projeto que monta a mensagem. Nenhum
 * componente deve concatenar texto por conta própria: o dia em que a Lennys
 * quiser mudar a saudação, muda aqui (ou no template em `configuracoes`) e
 * vale para o site inteiro.
 */

/** Remove tudo que não for dígito. O wa.me só aceita número puro com DDI. */
export function normalizarNumero(numero: string): string {
  return numero.replace(/\D/g, "");
}

/**
 * Monta a URL do wa.me. Quando `mensagem` vem preenchida, ela já chega
 * digitada na conversa.
 */
export function linkWhatsapp(numero: string, mensagem?: string): string {
  const limpo = normalizarNumero(numero);
  const base = `https://wa.me/${limpo}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

export const TEMPLATE_PADRAO =
  "Olá! Tenho interesse no {nome} ({preco}). Link: {url}";

/** O que a cliente preencheu antes de clicar. Todos opcionais. */
export interface DadosReserva {
  tamanho?: string;
  /** ISO curto, "2026-10-12". Vem de um input type="date". */
  data?: string;
}

export interface OpcoesMensagem {
  /** URL absoluta da página do vestido. */
  url: string;
  /**
   * Template vindo de `configuracoes`. Aceita {nome}, {preco}, {url} e
   * {cupom}. Quando ausente ou vazio, usa o padrão acima.
   */
  template?: string | null;
  cupom?: CupomPublico | null;
  reserva?: DadosReserva | null;
}

/**
 * Texto que a cliente envia ao ateliê.
 *
 * Recebe os dados prontos em vez de consultar o banco: assim continua sendo
 * função pura, testável e utilizável tanto no servidor quanto no cliente. Quem
 * busca `configuracoes` é a página.
 */
export function montarMensagem(
  produto: ProdutoComCategoria,
  opcoes: OpcoesMensagem,
): string {
  // Passa por calcularPreco para o valor da mensagem ser exatamente o que a
  // cliente viu na tela. Citar o preco cheio depois de anunciar desconto e o
  // jeito mais rapido de comecar a conversa com uma frustracao.
  const { final } = calcularPreco(produto, opcoes.cupom);
  const preco = final === null ? "sob consulta" : precoBRL(final);

  const base = opcoes.template?.trim() || TEMPLATE_PADRAO;

  const mensagem = base
    .replaceAll("{nome}", produto.nome)
    .replaceAll("{preco}", preco)
    .replaceAll("{url}", opcoes.url)
    .replaceAll("{cupom}", opcoes.cupom?.codigo ?? "");

  // O que a cliente preencheu vira linhas separadas, uma por campo. Assim a
  // dona do ateliê lê a conversa de relance na lista do WhatsApp, em vez de
  // caçar a informação no meio de um parágrafo.
  const partes: string[] = [mensagem.trim()];

  const detalhes: string[] = [];
  if (opcoes.reserva?.tamanho?.trim()) {
    detalhes.push(`Tamanho: ${opcoes.reserva.tamanho.trim()}`);
  }
  if (opcoes.reserva?.data) {
    detalhes.push(`Data do evento: ${dataBR(opcoes.reserva.data)}`);
  }
  if (detalhes.length) partes.push(detalhes.join("\n"));

  if (opcoes.cupom) partes.push(`Cupom: ${opcoes.cupom.codigo}`);

  return partes.join("\n\n");
}
