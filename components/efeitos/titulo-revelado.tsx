import { Fragment, type ReactNode } from "react";

/**
 * Quebra um texto em palavras, cada uma numa janela própria.
 *
 * A quebra acontece no servidor, não no navegador. Fazer isso depois da
 * hidratação significaria mexer em DOM que o React acha que é dele, e o texto
 * completo não estaria no HTML para o Google ler. Assim o marcador já sai
 * pronto e o JavaScript só precisa dizer "apareceu".
 *
 * O `--i` de cada palavra é a defasagem: a segunda palavra entra 40ms depois
 * da primeira, e assim por diante.
 */
export function TextoEmPalavras({ texto }: { texto: string }) {
  const palavras = texto.trim().split(/\s+/);

  return (
    <>
      {palavras.map((palavra, indice) => (
        <Fragment key={`${palavra}-${indice}`}>
          <span className="palavra">
            <span
              className="palavra__interior"
              style={{ "--i": indice } as React.CSSProperties}
            >
              {palavra}
            </span>
          </span>
          {/* O espaço precisa ser irmão da janela, não filho: dentro de um
              `inline-block` com `overflow: hidden` ele some, e o título sai
              com as palavras coladas. */}
          {indice < palavras.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** Envolve qualquer conteúdo com a foto que sai do zoom. */
export function Zoom({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-revelar="zoom" suppressHydrationWarning className={className}>
      {children}
    </div>
  );
}
