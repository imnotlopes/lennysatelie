"use client";

import { useEffect } from "react";

type Fbq = (
  comando: string,
  evento: string,
  parametros?: Record<string, string>,
) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/**
 * Dispara o evento `Contact` da Meta quando a visitante abre o WhatsApp.
 *
 * POR QUE `Contact` E NÃO `Lead`
 * ------------------------------
 * `Contact` é o evento que a Meta define para início de contato por chat,
 * telefone ou mensagem, que é exatamente o que acontece aqui. `Lead`
 * pressupõe captura de dados num formulário, e o site não captura nada: a
 * visitante clica e sai. `Schedule` também não serve, porque a prova é
 * marcada dentro da conversa, não no site.
 *
 * POR QUE UM OUVINTE SÓ, E NÃO UM onClick EM CADA BOTÃO
 * -----------------------------------------------------
 * Existem cinco botões de WhatsApp no site: a reserva da página de produto, o
 * flutuante, a faixa da home, a seção de parcerias e o rodapé. Só o primeiro
 * é componente de cliente. Pendurar `onClick` nos outros obrigaria a
 * convertê-los, e cada conversão dessas manda mais JavaScript para o browser
 * sem necessidade.
 *
 * Com delegação no documento, um arquivo resolve todos, e qualquer botão de
 * WhatsApp criado no futuro já nasce medido sem ninguém lembrar disto aqui.
 *
 * Fase de captura (`true`): garante o disparo mesmo que algum handler mais
 * interno pare a propagação do clique.
 *
 * Este evento é só para a Meta. A telemetria própria do ateliê, que alimenta
 * o painel, continua no servidor, em `registrarCliqueWhatsapp`. São dois
 * registros independentes de propósito: um pode falhar sem derrubar o outro.
 */
const DESTINOS = ["wa.me", "api.whatsapp.com", "web.whatsapp.com"];

export function ContatoWhatsapp() {
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;

      const link = alvo.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      if (!DESTINOS.some((destino) => href.includes(destino))) return;

      // Se o pixel não carregou, por bloqueador ou por falta da variável de
      // ambiente, `fbq` não existe e o clique segue normalmente.
      window.fbq?.("track", "Contact");
    }

    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  return null;
}
