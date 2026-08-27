"use client";

import { usePathname } from "next/navigation";
import { IconeWhatsapp } from "@/components/icons";
import { ehRotaSemWhatsapp } from "@/lib/navigation";

export interface WhatsappFloatProps {
  /** Link já montado no servidor, a partir de `configuracoes`. */
  href: string;
}

/**
 * Botão flutuante, presente em todas as rotas menos /admin e /styleguide.
 *
 * O `"use client"` existe só por causa do `usePathname`. O link em si é
 * montado no servidor e chega pronto por prop, para a regra de negócio não
 * vazar para o browser.
 */
export function WhatsappFloat({ href }: WhatsappFloatProps) {
  const pathname = usePathname();
  if (ehRotaSemWhatsapp(pathname)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        // Circulo, e nao quadrado como o resto do sistema: botao flutuante e
        // uma convencao propria, e a bolinha e o que a cliente reconhece como
        // "falar agora" sem precisar ler.
        "fixed right-4 bottom-4 z-20 flex size-12 items-center justify-center rounded-full",
        // Rose cheio de proposito, e nao tinta: nao e a acao principal de
        // nenhuma tela, e presenca ambiente. Se fosse escuro competiria com o
        // botao de reservar. Ver a nota das variantes em components/ui/button.
        "border border-accent bg-accent text-ink",
        "transition-colors duration-200 ease-brand",
        "hover:bg-transparent hover:text-accent-ink",
      ].join(" ")}
    >
      <IconeWhatsapp />
      <span className="sr-only">
        Falar com o ateliê no WhatsApp, abre em nova aba
      </span>
    </a>
  );
}
