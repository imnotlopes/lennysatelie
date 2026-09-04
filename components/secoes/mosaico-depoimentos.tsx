"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BLUR_DATA_URL, urlDaMidia } from "@/lib/images";
import type { Midia } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/** Quanto tempo cada depoimento fica no lugar antes de dar a vez. */
const MS_POR_ITEM = 4000;

/**
 * Os lugares do mosaico: médios e pequenos.
 *
 * Todos com a mesma largura — uma coluna. O que muda é a altura: o médio ocupa
 * duas fileiras, o pequeno uma. A primeira versão tinha um lugar grande de duas
 * colunas por duas fileiras, e no desktop ele dominava a seção inteira.
 *
 * `fonte` diz de qual pilha o lugar se serve. O médio recebe print de mensagem,
 * porque conversa é alta e estreita e é essa a forma que ele tem. O pequeno
 * recebe os stories, que são foto com legenda grande.
 *
 * A ordem importa: alternando médio e pequenos, a grade se fecha sem sobra —
 * o médio ocupa uma coluna inteira e os pequenos empilham dois a dois ao lado.
 */
const LUGARES = [
  { fonte: "mensagens", classe: "row-span-2", proporcao: "h-full" },
  { fonte: "fotos", classe: "", proporcao: "aspect-3/4" },
  { fonte: "fotos", classe: "", proporcao: "aspect-3/4" },
  { fonte: "mensagens", classe: "row-span-2", proporcao: "h-full" },
  { fonte: "fotos", classe: "", proporcao: "aspect-3/4" },
  { fonte: "fotos", classe: "", proporcao: "aspect-3/4" },
] as const;

/**
 * Quantos lugares o servidor desenha antes de saber o tamanho da tela.
 *
 * Três: um médio e dois pequenos, que é o que fecha duas colunas. Os outros
 * três entram depois da hidratação, quando dá para saber que a tela é larga.
 *
 * Desenhar os cinco e esconder os extras por CSS não funciona — imagem
 * escondida continua sendo baixada. Foi medido nas capas de coleção.
 */
const LUGARES_INICIAIS = 3;

export interface MosaicoDepoimentosProps {
  /** Prints de conversa. Vão para o lugar grande, onde dá para ler. */
  mensagens: Midia[];
  /** Stories do ateliê: cliente com a peça e a legenda já na arte. */
  fotos: Midia[];
}

/**
 * Os depoimentos num mosaico que se reveza.
 *
 * Antes eram duas seções na home — um trilho de stories e uma parede de prints
 * — separadas pela seção de vídeos. Mesmo assunto, dois formatos, com outra
 * coisa no meio. Agora é uma só.
 *
 * Cada lugar mostra o item `(atual + posição)` da sua pilha e anda de um em um,
 * como as capas de coleção. Quem tem dezenove depoimentos e seis lugares não
 * precisa empilhar dezenove: eles passam.
 *
 * Para assim que o dedo encosta. Sem isso a visitante começa a ler uma
 * mensagem e ela troca no meio da frase.
 */
export function MosaicoDepoimentos({
  mensagens,
  fotos,
}: MosaicoDepoimentosProps) {
  const [atual, setAtual] = useState(0);
  const [parado, setParado] = useState(false);
  const [lugares, setLugares] = useState(LUGARES_INICIAIS);
  const menosMovimento = useRef(false);

  useEffect(() => {
    menosMovimento.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const medir = () =>
      setLugares(window.innerWidth >= 1025 ? LUGARES.length : LUGARES_INICIAIS);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  const visiveis = LUGARES.slice(0, lugares);

  // Só gira se alguma pilha tiver mais itens que lugares servindo-se dela.
  const gira =
    mensagens.length > visiveis.filter((l) => l.fonte === "mensagens").length ||
    fotos.length > visiveis.filter((l) => l.fonte === "fotos").length;

  useEffect(() => {
    if (!gira || parado || menosMovimento.current) return;
    const id = window.setInterval(() => setAtual((i) => i + 1), MS_POR_ITEM);
    return () => window.clearInterval(id);
  }, [gira, parado]);

  // Cada pilha anda no seu próprio passo, senão as fotos dariam a volta muito
  // antes das mensagens e ficariam se repetindo enquanto o lugar grande ainda
  // está na primeira rodada.
  const contadores = { mensagens: 0, fotos: 0 };

  return (
    <ul
      onPointerDown={() => setParado(true)}
      onFocusCapture={() => setParado(true)}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {visiveis.map((lugar, posicao) => {
        const pilha = lugar.fonte === "mensagens" ? mensagens : fotos;
        if (!pilha.length) return null;

        const indice = contadores[lugar.fonte]++;
        const item = pilha[(atual + indice) % pilha.length];

        return (
          <li key={posicao} className={lugar.classe}>
            <div
              // A chave muda quando o depoimento daquele lugar muda, o que
              // remonta o bloco e dispara a entrada suave — mesma mecânica das
              // capas de coleção.
              key={item.id}
              className={cn(
                "relative w-full overflow-hidden bg-surface-alt",
                lugar.proporcao,
                gira && "capa-entrando",
              )}
            >
              <Image
                src={urlDaMidia(item.arquivo)}
                alt={item.texto_alt ?? ""}
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                // Médio e pequeno têm a mesma largura: uma coluna. Só a
                // altura muda, e altura não entra nesta conta.
                sizes="(min-width: 1025px) 20vw, 50vw"
                className="object-cover"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
