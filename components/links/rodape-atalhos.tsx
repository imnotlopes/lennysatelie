"use client";

import { ICONES_LINK } from "@/components/links/icones";
import { registrarClique } from "@/components/links/usar-clique";
import type { Link as LinkRow } from "@/lib/supabase/types";

/**
 * Os mesmos links do topo, em quadradinhos, no rodapé.
 *
 * Repete o que já está acima de propósito. Quem desceu para ver as coleções e
 * os prints chegou no fim da página longe dos botões, e nessa hora a escolha é
 * entre rolar de volta ou fechar. A fileira de ícones resolve isso sem ocupar
 * uma tela.
 *
 * O rótulo de cada um é o título do link, não o nome da rede: quem usa leitor
 * de tela ouve "Falar no WhatsApp", que diz o que acontece, e não "WhatsApp",
 * que é só onde.
 */
export function RodapeAtalhos({ links }: { links: LinkRow[] }) {
  if (!links.length) return null;

  return (
    <nav aria-label="Atalhos">
      <ul className="flex items-center justify-center gap-1.5">
        {links.map((link) => {
          const Icone = ICONES_LINK[link.icone];
          const externo = !link.url.startsWith("mailto:");

          return (
            <li key={link.id}>
              <a
                href={link.url}
                {...(externo
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={link.titulo}
                onClick={() => registrarClique(link.id)}
                // 45px, que é o alvo de toque mínimo do WCAG com um pixel de
                // folga. Foi o maior que deixa os seis numa fileira só em
                // telas de 360px: com 55px o último caía sozinho na linha de
                // baixo, e ícone órfão lê como erro.
                className="flex size-9 shrink-0 items-center justify-center border border-line text-ink transition-colors duration-200 ease-brand hover:border-ink hover:text-accent-ink"
              >
                <Icone className="size-5" />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
