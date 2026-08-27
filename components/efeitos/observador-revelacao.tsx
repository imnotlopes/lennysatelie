"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marca `data-visivel` em tudo que tem `data-revelar` quando entra na tela.
 *
 * Um observador só para a página inteira, montado uma vez no layout, em vez
 * de um componente cliente por foto. Numa listagem de 50 vestidos a diferença
 * é entre 50 ilhas de JavaScript e uma.
 *
 * Marca e para de observar: a revelação acontece uma vez por visita. Repetir
 * a cada rolagem cansa quem só quer descer a página.
 *
 * O componente não renderiza nada e não envolve nada — por isso os elementos
 * continuam sendo Server Components, com o HTML completo vindo do servidor.
 */
export function ObservadorRevelacao() {
  // Refaz a varredura a cada navegação: o conteúdo novo chega sem recarregar.
  const caminho = usePathname();

  useEffect(() => {
    const alvos = document.querySelectorAll<HTMLElement>(
      "[data-revelar]:not([data-visivel])",
    );
    if (!alvos.length) return;

    // Navegador sem IntersectionObserver: mostra tudo de uma vez, sem efeito.
    if (typeof IntersectionObserver === "undefined") {
      alvos.forEach((el) => el.setAttribute("data-visivel", "true"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.setAttribute("data-visivel", "true");
          observador.unobserve(entrada.target);
        }
      },
      {
        // Dispara quando o elemento passa 8% para dentro da tela, e não quando
        // já está todo visível: assim o movimento acontece enquanto a pessoa
        // rola, e não depois que ela parou e já leu.
        rootMargin: "0px 0px -8% 0px",
        threshold: 0,
      },
    );

    alvos.forEach((el) => observador.observe(el));

    // O que já estava na tela no primeiro quadro é revelado na hora, senão o
    // topo da página fica esperando uma rolagem que talvez não venha.
    return () => observador.disconnect();
  }, [caminho]);

  return null;
}
