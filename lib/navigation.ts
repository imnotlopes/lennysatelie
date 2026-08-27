/**
 * Fonte única da navegação. Header, drawer mobile e footer leem daqui, para
 * não existir a chance de um link ser adicionado num lugar e esquecido no
 * outro.
 */

export interface ItemNavegacao {
  href: string;
  rotulo: string;
}

export const NAVEGACAO_PRINCIPAL: ItemNavegacao[] = [
  { href: "/", rotulo: "Home" },
  { href: "/acervo", rotulo: "Acervo" },
  { href: "/como-funciona", rotulo: "Como funciona" },
  { href: "/perguntas-frequentes", rotulo: "Perguntas frequentes" },
  { href: "/contato", rotulo: "Contato" },
];

/** Rotas que não recebem o botão flutuante de WhatsApp. */
export const ROTAS_SEM_WHATSAPP = ["/admin", "/styleguide"];

export function ehRotaSemWhatsapp(pathname: string): boolean {
  return ROTAS_SEM_WHATSAPP.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`),
  );
}
