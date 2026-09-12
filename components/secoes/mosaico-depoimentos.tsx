"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BLUR_DATA_URL, urlDaMidia } from "@/lib/images";
import type { Midia } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/** Quanto tempo cada depoimento fica no lugar antes de dar a vez. */
const MS_POR_ITEM = 4000;

/**
 * Quantos lugares o servidor desenha antes de saber o tamanho da tela.
 *
 * Quatro, que é o que preenche duas colunas. Os outros entram depois da
 * hidratação, quando dá para saber que a tela é larga. Desenhar todos e
 * esconder os extras por CSS não funciona: imagem escondida continua sendo
 * baixada, e no celular isso é banda jogada fora.
 */
const LUGARES_INICIAIS = 4;
const LUGARES_DESKTOP = 8;
/** O bloco de dois da página de links. Mesmo número em qualquer largura. */
const LUGARES_COMPACTO = 2;

export interface MosaicoDepoimentosProps {
  /** Prints de conversa. Quase quadrados: proporção entre 0,64 e 0,98. */
  mensagens: Midia[];
  /** Stories do ateliê: cliente com a peça, sempre em 9:16. */
  fotos: Midia[];
  /**
   * Um bloco de dois, numa fileira só, em qualquer largura.
   *
   * Para a página de links, onde a prova é apoio e não assunto: lá a seção
   * existe para dizer "tem gente falando bem", não para a pessoa ler os
   * dezenove. Com dois quadros a fila continua girando por todos, então nada
   * fica inalcançável — só leva mais voltas.
   */
  compacto?: boolean;
}

/**
 * Os depoimentos numa esteira, como as capas de coleção.
 *
 * DUAS CORREÇÕES MORAM AQUI
 * -------------------------
 * 1. Repetição. A versão anterior tinha uma fila por tipo e adiantava um lugar
 *    de cada vez. Nessa conta o índice de um lugar encostava no do lugar
 *    seguinte da mesma fila, e os dois mostravam a mesma imagem. Agora é uma
 *    fila só e cada lugar mostra a posição `(atual + i)` dela — posições
 *    consecutivas nunca coincidem, e são dezenove itens para no máximo oito
 *    lugares.
 *
 * 2. Dureza. As capas de coleção são suaves porque todo cartão tem o mesmo
 *    tamanho: a troca não mexe no layout. Aqui cada imagem tem a sua proporção,
 *    então a grade se reorganizava a cada troca — o que saltava era a página,
 *    não a animação. Agora o quadro tem tamanho fixo e a imagem entra INTEIRA
 *    dentro dele, com sobra quando a proporção não bate.
 *
 * A sobra é de propósito. Recortar para preencher foi a primeira tentativa e
 * cortou as mensagens pela metade — print de conversa existe para ser lido.
 * Sobra clara em volta lê-se como cartão; mensagem cortada não se lê.
 */
export function MosaicoDepoimentos({
  mensagens,
  fotos,
  compacto = false,
}: MosaicoDepoimentosProps) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const [lugares, setLugares] = useState(
    compacto ? LUGARES_COMPACTO : LUGARES_INICIAIS,
  );
  const [ampliada, setAmpliada] = useState<Midia | null>(null);
  const menosMovimento = useRef(false);

  // Intercala mensagem e foto para os dois tipos aparecerem espalhados, em vez
  // de todas as mensagens juntas e depois todas as fotos.
  const fila = useMemo(() => {
    const saida: Midia[] = [];
    for (let i = 0; i < Math.max(mensagens.length, fotos.length); i++) {
      if (mensagens[i]) saida.push(mensagens[i]);
      if (fotos[i]) saida.push(fotos[i]);
    }
    return saida;
  }, [mensagens, fotos]);

  useEffect(() => {
    menosMovimento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const medir = () => {
      if (compacto) return setLugares(LUGARES_COMPACTO);
      setLugares(window.innerWidth >= 1025 ? LUGARES_DESKTOP : LUGARES_INICIAIS);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [compacto]);

  // Também para enquanto uma imagem está aberta: girar por trás faria outra
  // aparecer no lugar dela assim que fechasse.
  const gira = !parado && !ampliada && fila.length > lugares;

  useEffect(() => {
    if (!gira || menosMovimento.current) return;
    const id = window.setInterval(() => setAtual((i) => i + 1), MS_POR_ITEM);
    return () => window.clearInterval(id);
  }, [gira]);

  useEffect(() => {
    if (!ampliada) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(null);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ampliada]);

  const visiveis: Midia[] = [];
  for (let i = 0; i < lugares && fila.length; i++) {
    visiveis.push(fila[(atual + i) % fila.length]);
  }

  return (
    <>
      <ul
        onPointerDown={() => setParado(true)}
        onFocusCapture={() => setParado(true)}
        className={cn(
          "grid grid-cols-2 gap-3",
          !compacto && "lg:grid-cols-4",
        )}
      >
        {visiveis.map((item, posicao) => (
          <li key={posicao}>
            <button
              type="button"
              onClick={() => setAmpliada(item)}
              aria-label="Ver este depoimento maior"
              className="block w-full cursor-zoom-in"
            >
              <div
                // A chave muda quando o depoimento daquele lugar muda, o que
                // remonta o bloco e dispara a entrada — mesma mecânica das
                // capas de coleção.
                key={item.id}
                className={cn(
                  "relative aspect-4/5 w-full overflow-hidden bg-surface-raised",
                  "transition-opacity duration-200 ease-brand hover:opacity-90",
                  gira && "esteira-entrando",
                )}
              >
                <Image
                  src={urlDaMidia(item.arquivo)}
                  alt={item.texto_alt ?? ""}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(min-width: 1025px) 22vw, 45vw"
                  // `contain` e não `cover`: a imagem entra inteira, com sobra
                  // quando a proporção não bate. Recortar cortaria a mensagem.
                  className="object-contain p-2"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Ampliação. As imagens de origem são pequenas — o print menor tem
          326px de largura — então isto mostra a imagem inteira no maior
          tamanho que a tela permite, e não um zoom de verdade. Mais que isso
          seria esticar pixel que não existe. */}
      {ampliada ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Depoimento de cliente"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setAmpliada(null)}
            className="absolute inset-0 cursor-zoom-out"
          />
          {/* Caixa de tamanho definido com a imagem preenchendo por dentro.
              Com `w-auto` a largura do elemento dependia da imagem baixada, e a
              imagem baixada dependia da largura: o Next resolvia esse laço
              servindo a menor versão possível, e a foto "ampliada" saía com
              149px — menor que a miniatura. Medido. */}
          <div className="relative h-[88svh] w-[92vw]">
            <Image
              src={urlDaMidia(ampliada.arquivo)}
              alt={ampliada.texto_alt ?? ""}
              fill
              sizes="92vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
