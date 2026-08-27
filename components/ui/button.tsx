import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "soft"
  | "inverse"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base = [
  "inline-flex items-center justify-center gap-2",
  "rounded-none border font-sans uppercase",
  "text-xs tracking-caps leading-none",
  "transition-colors duration-200 ease-brand",
  "disabled:cursor-not-allowed",
].join(" ");

/**
 * Quem preenche o quê, e por quê.
 *
 * - Tinta cheia (`primary`): a ação principal da tela. Uma por tela.
 * - Rosé cheio: NÃO é botão. Fica para a presença ambiente do ateliê — a
 *   bolinha flutuante do WhatsApp e a faixa de cupom. Como acento, aparece
 *   também no hover de todo `primary`, na marcação de filtro e na régua de
 *   preço.
 * - Traço (`outline`, `secondary`): ação secundária.
 *
 * A regra existe porque antes o rosé preenchia a ação principal, e ele é mais
 * claro que o texto ao redor: o botão mais importante da página era o de menor
 * peso visual.
 */
const variants: Record<ButtonVariant, string> = {
  // Preenchido de tinta: o elemento mais pesado da tela, como manda a ação
  // principal. O rosé preenchia antes, mas é mais claro que o texto ao redor
  // — o botão mais importante era o de menor peso visual. Agora o rosé entra
  // no hover, que é o papel dele: acento, não preenchimento dominante.
  primary: [
    "border-ink bg-ink text-ink-inverse",
    "hover:border-accent hover:bg-accent hover:text-ink",
    "disabled:border-disabled disabled:bg-disabled disabled:text-ink",
  ].join(" "),

  // Espelho do primary: vazio em repouso, preenche de rosé no hover.
  secondary: [
    "border-accent bg-transparent text-accent-ink",
    "hover:bg-accent hover:text-ink",
    "disabled:border-disabled disabled:bg-disabled disabled:text-ink",
  ].join(" "),

  // Traço neutro. Vira acento no hover, como todo elemento do sistema.
  outline: [
    "border-line-strong bg-transparent text-ink",
    "hover:border-accent hover:text-accent-ink",
    "disabled:border-disabled disabled:text-ink-faded",
  ].join(" "),

  // Traço neutro sobre fundo areia. Para o bloco que precisa se destacar do
  // fundo da página sem virar ação principal — hoje, o campo de cupom.
  soft: [
    "border-line-strong bg-surface-alt text-ink",
    "hover:border-accent-ink hover:text-accent-ink",
    "disabled:border-disabled disabled:text-ink-faded",
  ].join(" "),

  // Traço claro, para uso sobre foto escura. Existe como variante e não como
  // `className` solto porque `cn` não resolve conflito entre classes do mesmo
  // grupo: `border-ink-inverse` colado num variante que já traz
  // `border-transparent` não vence de forma confiável.
  inverse: [
    "border-ink-inverse bg-transparent text-ink-inverse",
    "hover:bg-ink-inverse hover:text-ink",
    "disabled:border-disabled disabled:text-ink-faded",
  ].join(" "),

  // Ação que destrói dado. Vermelho cheio, e só dentro de um diálogo de
  // confirmação — nunca solto numa lista, onde o clique errado é barato.
  danger: [
    "border-error bg-error text-ink-inverse",
    "hover:bg-transparent hover:text-error",
    "disabled:border-disabled disabled:bg-disabled disabled:text-ink",
  ].join(" "),

  // Sem traço. Para ações secundárias dentro de blocos densos.
  ghost: [
    "border-transparent bg-transparent text-ink",
    "hover:text-accent-ink",
    "disabled:text-ink-faded",
  ].join(" "),
};

// Com --spacing: 5px, cada unidade Tailwind vale 5px.
// Com --spacing: 5px, cada unidade Tailwind vale 5px. Quatro medidas, e
// nenhuma altura solta fora daqui — era isso que produzia sete alturas
// diferentes no site.
const sizes: Record<ButtonSize, string> = {
  sm: "h-7 px-3", // 35px de altura, 15px de padding
  md: "h-9 px-4", // 45px e 20px — a medida da referência
  lg: "h-11 px-6", // 55px e 30px
  xl: "h-12 px-6", // 60px — ação principal da página de peça
};

/**
 * As classes de um botão, sem o elemento.
 *
 * Existe porque metade das ações da vitrine são links (`<a>`, `<Link>`), não
 * botões — "Conheça o acervo", "Carregar mais", "Reservar pelo WhatsApp". Sem
 * isto cada uma reescrevia o estilo à mão, e foi assim que o site acabou com
 * sete alturas de botão diferentes para três definidas aqui.
 */
export function estilosBotao({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra o indicador de carregamento e bloqueia o clique. */
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={estilosBotao({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 animate-spin rounded-full border border-current border-t-transparent"
    />
  );
}
