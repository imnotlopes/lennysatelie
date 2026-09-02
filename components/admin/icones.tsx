/**
 * Ícones do painel.
 *
 * SVG inline, sem biblioteca: são nove desenhos de traço simples, e uma
 * dependência inteira para isso pesaria mais que o painel.
 *
 * Todos no mesmo formato — 24x24, traço de 1.5, `currentColor` — para
 * herdarem a cor do estado ativo sem cada um precisar saber onde está.
 */

export type Icone = (props: { className?: string }) => React.ReactElement;

function Base({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Quatro quadrados: a visão geral. */
export const IconeInicio: Icone = ({ className }) => (
  <Base className={className}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </Base>
);

/** Um vestido de alças, visto de frente. */
export const IconeVestidos: Icone = ({ className }) => (
  <Base className={className}>
    <path d="M9 3l3 2 3-2" />
    <path d="M9 3L7.5 7.5 9.5 9l-2 10h9l-2-10 2-1.5L15 3" />
  </Base>
);

/** Pilha de folhas: as coleções. */
export const IconeColecoes: Icone = ({ className }) => (
  <Base className={className}>
    <path d="M12 3l9 5-9 5-9-5 9-5Z" />
    <path d="M3 13l9 5 9-5" />
  </Base>
);

/** Etiqueta com furo: o cupom. */
export const IconeCupons: Icone = ({ className }) => (
  <Base className={className}>
    <path d="M12.6 3H21v8.4L11.4 21 3 12.6 12.6 3Z" />
    <circle cx="17" cy="7" r="1.2" />
  </Base>
);

/** Moldura com sol: as imagens do site. */
export const IconeImagens: Icone = ({ className }) => (
  <Base className={className}>
    <rect x="3" y="4" width="18" height="16" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 16l-5-5-9 9" />
  </Base>
);

/** Marcador de página: a etiqueta da peça. */
export const IconeEtiquetas: Icone = ({ className }) => (
  <Base className={className}>
    <path d="M6 3h12v18l-6-4.5L6 21V3Z" />
  </Base>
);

/** Engrenagem simplificada: os ajustes. */
export const IconeConfiguracoes: Icone = ({ className }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Base>
);

/** Porta com seta saindo. */
export const IconeSair: Icone = ({ className }) => (
  <Base className={className}>
    <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
    <path d="M10 17l5-5-5-5M15 12H3" />
  </Base>
);

/** Três pontos: o resto do painel. */
export const IconeMais: Icone = ({ className }) => (
  <Base className={className}>
    <circle cx="5" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="19" cy="12" r="1.4" />
  </Base>
);
