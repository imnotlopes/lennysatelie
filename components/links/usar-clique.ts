"use client";

import { registrarCliqueLink } from "@/app/actions/links";

/**
 * Registra o clique sem segurar a navegação.
 *
 * `void` de propósito: esperar a resposta antes de deixar a pessoa sair
 * trocaria um dado de painel por meio segundo de espera na frente de quem
 * está indo falar no WhatsApp. Se a gravação falhar, ela falha em silêncio —
 * `registrarEvento` já não lança.
 *
 * Funciona porque os links abrem em aba nova: esta página continua viva e o
 * pedido termina. O único caso em que a página sai é o `mailto:`, e nele o
 * navegador abre o aplicativo de e-mail sem descarregar a aba.
 */
export function registrarClique(linkId: string): void {
  void registrarCliqueLink(linkId);
}
