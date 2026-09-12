"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

export interface GaleriaProps {
  imagens: string[];
  /** Vira o alt da imagem principal. */
  nome: string;
}

/**
 * Galeria do produto.
 *
 * Desktop: miniaturas verticais à esquerda e zoom no hover, com o ponto de
 * origem seguindo o cursor.
 *
 * Celular: trilho arrastável com snap, e as miniaturas embaixo da foto.
 *
 * POR QUE AS MINIATURAS DO CELULAR EXISTEM
 * ----------------------------------------
 * Durante um tempo não existiram. Embaixo da foto havia só a linha "Foto 1 de
 * 5", e o comentário aqui em cima já dizia que havia miniaturas — descrevia
 * uma intenção que nunca foi escrita em código.
 *
 * O problema não era o texto estar errado, era o que ele substituía. Contador
 * INFORMA que há mais fotos; miniatura MOSTRA. Quem abre a peça no celular vê
 * uma foto que ocupa a tela inteira e nada indicando que dá para arrastar: a
 * linha de texto embaixo é fácil de não ler, e quem não arrasta sai achando
 * que o vestido tem uma foto só.
 *
 * O contador continua, agora só para leitor de tela, porque ali ele é o que
 * funciona: quem não enxerga a fileira precisa ouvir a posição mudar.
 *
 * Com uma imagem só, miniaturas e arraste somem — não há o que navegar.
 */
export function Galeria({ imagens, nome }: GaleriaProps) {
  const [ativa, setAtiva] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origem, setOrigem] = useState("50% 50%");
  const trilhoRef = useRef<HTMLDivElement>(null);

  const varias = imagens.length > 1;

  function aoMover(evento: React.MouseEvent<HTMLDivElement>) {
    const r = evento.currentTarget.getBoundingClientRect();
    const x = ((evento.clientX - r.left) / r.width) * 100;
    const y = ((evento.clientY - r.top) / r.height) * 100;
    setOrigem(`${x}% ${y}%`);
  }

  function aoRolarTrilho() {
    const el = trilhoRef.current;
    if (!el) return;
    const indice = Math.round(el.scrollLeft / el.clientWidth);
    setAtiva(Math.min(Math.max(indice, 0), imagens.length - 1));
  }

  /**
   * Escolhe uma foto pelas miniaturas.
   *
   * No desktop basta trocar o estado, porque a foto grande lê `ativa`. No
   * celular a foto visível é a posição do trilho, então clicar numa miniatura
   * sem rolar o trilho acenderia a miniatura certa e deixaria a foto errada
   * na tela.
   *
   * A largura zero é o trilho escondido pelo CSS no desktop. Rolar ele ali
   * não faria nada visível agora, mas deixaria a posição em zero para quem
   * depois estreitasse a janela.
   */
  function irPara(indice: number) {
    setAtiva(indice);
    const el = trilhoRef.current;
    if (!el || el.clientWidth === 0) return;
    el.scrollTo({ left: indice * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {/* Miniaturas verticais, só no desktop */}
      {varias ? (
        <ul className="order-2 hidden shrink-0 flex-col gap-2 lg:order-1 lg:flex">
          {imagens.map((src, i) => (
            <li key={src}>
              <Miniatura
                src={src}
                indice={i}
                total={imagens.length}
                ativa={i === ativa}
                aoClicar={() => irPara(i)}
                className="w-16"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {/* Imagem principal: no desktop, uma só com zoom */}
      <div
        className="order-1 hidden min-w-0 flex-1 lg:order-2 lg:block"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={aoMover}
      >
        <div className="relative aspect-product w-full overflow-hidden bg-surface-alt">
          <Image
            src={imagens[ativa]}
            alt={`Vestido ${nome}`}
            fill
            priority
            sizes="(min-width: 1025px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={cn(
              "object-cover transition-transform duration-300 ease-soft",
              "motion-reduce:transform-none",
              zoom ? "scale-150" : "scale-100",
            )}
            style={{ transformOrigin: origem }}
          />
        </div>
      </div>

      {/* Celular: trilho arrastável com snap, e as miniaturas embaixo */}
      <div className="order-1 flex flex-col gap-2 lg:hidden">
        <div
          ref={trilhoRef}
          onScroll={aoRolarTrilho}
          role="region"
          aria-label={`Fotos do vestido ${nome}`}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {imagens.map((src, i) => (
            <div
              key={src}
              className="relative aspect-product w-full shrink-0 snap-start bg-surface-alt"
            >
              <Image
                src={src}
                alt={i === 0 ? `Vestido ${nome}` : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {varias ? (
          <>
            {/* A fileira rola quando não cabe: com cinco fotos numa tela de
                375px, encolher a miniatura para caber deixaria cada uma
                pequena demais para se reconhecer o vestido nela. */}
            <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {imagens.map((src, i) => (
                <li key={src}>
                  <Miniatura
                    src={src}
                    indice={i}
                    total={imagens.length}
                    ativa={i === ativa}
                    aoClicar={() => irPara(i)}
                    className="w-14"
                  />
                </li>
              ))}
            </ul>

            {/* Quem enxerga já tem a fileira acesa dizendo onde está. Quem não
                enxerga precisa ouvir a posição mudar a cada arraste. */}
            <p className="sr-only" aria-live="polite">
              Foto {ativa + 1} de {imagens.length}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Miniatura({
  src,
  indice,
  total,
  ativa,
  aoClicar,
  className,
}: {
  src: string;
  indice: number;
  total: number;
  ativa: boolean;
  aoClicar: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={`Ver foto ${indice + 1} de ${total}`}
      aria-current={ativa}
      className={cn(
        "relative block aspect-product shrink-0 overflow-hidden border",
        "transition-colors duration-200 ease-brand",
        ativa ? "border-ink" : "border-transparent hover:border-accent",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="80px"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover"
      />
    </button>
  );
}
