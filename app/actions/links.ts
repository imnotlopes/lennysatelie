"use server";

import { registrarEvento } from "@/lib/queries/eventos";

/**
 * Registra um clique num link da página de links.
 *
 * Sem trava por sessão, ao contrário da visita a produto: ali a trava existe
 * porque voltar para a mesma peça inflaria a contagem sem a pessoa ter feito
 * nada de novo. Aqui cada clique é uma saída de verdade — a mesma pessoa
 * abrindo o WhatsApp duas vezes tentou falar duas vezes, e isso interessa.
 *
 * Não devolve nada e não lança. Telemetria não pode atrasar nem impedir a
 * navegação de quem clicou.
 */
export async function registrarCliqueLink(linkId: string): Promise<void> {
  await registrarEvento("clique_link", undefined, undefined, linkId);
}
