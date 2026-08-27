"use server";

import { getProdutosPorSlugs, registrarEvento } from "@/lib/queries";

/**
 * Server Actions de telemetria da página de produto.
 *
 * `registrarEvento` já engole os próprios erros, então nenhuma destas derruba
 * a página. Quem chama não deve dar `await`: o objetivo é não atrasar em nada
 * a abertura do WhatsApp.
 */

export async function registrarVisitaProduto(produtoId: string) {
  await registrarEvento("visita_produto", produtoId);
}

export async function registrarCliqueWhatsapp(
  produtoId: string,
  cupomId?: string,
) {
  await registrarEvento("clique_whatsapp", produtoId, cupomId);
}

/**
 * Busca as peças que a visitante viu, para a seção de vistos recentemente.
 *
 * Precisa ser Server Action e não consulta direta no cliente porque o
 * histórico vive no navegador dela, mas os dados da peça vêm do banco.
 *
 * Limita a 12 slugs: histórico maior que isso não cabe na seção e só
 * atrasaria a resposta.
 */
export async function buscarProdutosVistos(slugs: string[]) {
  const limpos = slugs
    .filter((s) => typeof s === "string" && /^[a-z0-9-]+$/.test(s))
    .slice(0, 12);

  if (!limpos.length) return [];
  return getProdutosPorSlugs(limpos);
}
