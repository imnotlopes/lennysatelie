import type { SVGProps } from "react";

/**
 * Ícones em SVG inline, sem biblioteca. Traço de 1.5px para acompanhar o
 * peso da tipografia e `currentColor` para herdarem a cor do contexto.
 *
 * Todos são decorativos: quem dá o nome acessível é o botão ou link que os
 * envolve.
 */

type IconeProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconeBusca(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  );
}

export function IconeMenu(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Base>
  );
}

export function IconeFechar(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconeInstagram(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </Base>
  );
}

export function IconeWhatsapp(props: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-5"
      {...props}
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.17 8.17 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23Zm-2.6 4.2c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1.01.74 1.99.84 2.13.1.14 1.44 2.2 3.5 3.08.49.21.87.34 1.17.43.49.16.94.13 1.29.08.4-.06 1.21-.49 1.38-.97.17-.48.17-.9.12-.98-.05-.09-.19-.14-.4-.24-.2-.1-1.2-.6-1.39-.66-.18-.07-.32-.1-.46.1-.13.2-.52.65-.64.79-.12.14-.24.15-.44.05-.2-.1-.86-.32-1.63-1.01-.6-.54-1.01-1.2-1.13-1.4-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.06-.14.03-.26-.02-.36-.05-.1-.45-1.1-.62-1.5-.16-.4-.33-.34-.45-.35h-.38Z" />
    </svg>
  );
}

export function IconeFacebook(props: IconeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className="size-4"
      {...props}
    >
      <path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3.5H14c-2 0-3.5 1.3-3.5 3.4v1.6H8V11h2.5v9.5H14V11h2.3l.3-2.5H14Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Passos de "como funciona"                                                   */
/* -------------------------------------------------------------------------- */

export function IconeAgenda(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Base>
  );
}

export function IconeCabide(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M12 7a2 2 0 1 1 2-2c0 1.2-2 1.2-2 2v1" />
      <path d="M12 8 3.5 15.5c-.7.6-.3 1.8.6 1.8h15.8c.9 0 1.3-1.2.6-1.8L12 8Z" />
    </Base>
  );
}

export function IconeReserva(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </Base>
  );
}

export function IconeAjustes(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M7.8 16.2 18 4M16.2 16.2 6 4" />
    </Base>
  );
}

/**
 * Agulha com linha, para a confecção própria.
 *
 * Não reusa a tesoura de `IconeAjustes`: tesoura ali significa ajuste da peça
 * no corpo da cliente, e o mesmo desenho em dois selos vizinhos diria que as
 * duas coisas são a mesma.
 */
export function IconeAgulha(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M3.5 20.5 15 9" />
      <circle cx="16.6" cy="7.4" r="2.3" />
      <path d="M18.5 6.1c1.6-1.1 3.4-.2 2.9 1.6-.4 1.5-2.4 1.7-3.2.2" />
    </Base>
  );
}

export function IconeFesta(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function IconeDevolucao(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M4 12a8 8 0 1 0 2.5-5.8" />
      <path d="M4 4v4h4" />
    </Base>
  );
}

/* -------------------------------------------------------------------------- */
/* Setas do carrossel                                                          */
/* -------------------------------------------------------------------------- */

export function IconeEtiqueta(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.25" />
    </Base>
  );
}

/** Globo: o site. */
export function IconeGlobo(props: IconeProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </Base>
  );
}

/** Envelope: o e-mail. */
export function IconeEmail(props: IconeProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.8 6.2 7.3 5.5a1.5 1.5 0 0 0 1.8 0l7.3-5.5" />
    </Base>
  );
}

export function IconeSetaEsquerda(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="M15 5 8 12l7 7" />
    </Base>
  );
}

export function IconeSetaDireita(props: IconeProps) {
  return (
    <Base {...props}>
      <path d="m9 5 7 7-7 7" />
    </Base>
  );
}
