"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

export interface MosaicoDepoimentosProps {
  /** Prints de conversa. Quase quadrados: proporção entre 0,64 e 0,98. */
  mensagens: Midia[];
  /** Stories do ateliê: cliente com a peça, sempre em 9:16. */
  fotos: Midia[];
}

/**
 * Os depoimentos num mosaico que se reveza.
 *
 * Antes eram duas seções na home, com a seção de vídeos no meio. Agora é uma.
 *
 * Em colunas, e não em grade de células fixas — e isso é a correção de um erro
 * meu. A primeira versão dava a cada lugar um tamanho fixo e recortava a imagem
 * para caber. Só que os prints de conversa são quase quadrados (326x390) e os
 * stories são 9:16: nenhum tamanho fixo serve aos dois. O resultado foi
 * mensagem cortada pela metade, sem nada legível.
 *
 * Aqui cada imagem entra inteira, na proporção que ela tem. A variação de
 * tamanho vem do conteúdo: o story é alto, o print é baixo. É o que dá a
 * aparência de mosaico sem cortar nada.
 *
 * Cada lugar mostra o item `(atual + posição)` da sua pilha e anda de um em um,
 * como as capas de coleção. Para assim que o dedo encosta, senão a visitante
 * começa a ler uma mensagem e ela troca no meio da frase.
 */
export function MosaicoDepoimentos({
  mensagens,
  fotos,
}: MosaicoDepoimentosProps) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const [lugares, setLugares] = useState(LUGARES_INICIAIS);
  const [ampliada, setAmpliada] = useState<Midia | null>(null);
  const menosMovimento = useRef(false);

  useEffect(() => {
    menosMovimento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const medir = () =>
      setLugares(
        window.innerWidth >= 1025 ? LUGARES_DESKTOP : LUGARES_INICIAIS,
      );
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  // Também para enquanto uma imagem está aberta: girar por trás faria outra
  // aparecer no lugar dela assim que fechasse.
  const gira =
    !parado && !ampliada && mensagens.length + fotos.length > lugares;

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

  // Alterna as duas pilhas para as duas aparecerem misturadas, cada uma
  // andando no seu próprio passo. Sem isso os seis stories dariam a volta bem
  // antes das treze mensagens e ficariam se repetindo.
  const visiveis: Midia[] = [];
  let iMensagem = 0;
  let iFoto = 0;
  for (let i = 0; i < lugares; i++) {
    const pilha = i % 2 === 0 && mensagens.length ? mensagens : fotos;
    if (!pilha.length) continue;
    const indice = pilha === mensagens ? iMensagem++ : iFoto++;
    visiveis.push(pilha[(atual + indice) % pilha.length]);
  }

  return (
    <>
      <ul
        onPointerDown={() => setParado(true)}
        onFocusCapture={() => setParado(true)}
        className="columns-2 gap-3 lg:columns-4"
      >
        {visiveis.map((item, posicao) => (
          <li key={posicao} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => setAmpliada(item)}
              aria-label="Ver este depoimento maior"
              className={cn(
                "block w-full cursor-zoom-in overflow-hidden bg-surface-raised",
                "transition-opacity duration-200 ease-brand hover:opacity-90",
                gira && "capa-entrando",
              )}
            >
              <Image
                key={item.id}
                src={urlDaMidia(item.arquivo)}
                alt={item.texto_alt ?? ""}
                width={480}
                height={640}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1025px) 22vw, 45vw"
                // Largura cheia e altura automática: a altura sai da proporção
                // da própria imagem. É isto que impede o corte.
                className="h-auto w-full"
              />
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
