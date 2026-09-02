import Image from "next/image";
import { BLUR_DATA_URL, imagemCategoria } from "@/lib/images";
import type { Categoria } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface CapaColecaoProps {
  categoria: Categoria;
  /** Quantas peças a coleção tem, já contadas pela página. */
  pecas: number;
}

/**
 * Capa da coleção, no topo do acervo filtrado.
 *
 * Aparece quando a visitante escolheu uma coleção só. Ver "Debutantes e damas"
 * escrito grande sobre a foto certa diz onde ela está muito mais rápido que um
 * filtro marcado numa barra lateral.
 *
 * Mais baixa que o hero da home — 45% da tela, não 100%. Aqui a pessoa já
 * decidiu o que quer ver: a capa situa, não segura.
 *
 * Título centrado sobre a foto, no formato da referência que o Edson trouxe.
 *
 * Usa a foto de hero da coleção quando existe, senão a capa. São enquadramentos
 * diferentes: a capa é o cartão 3:4 da home, o hero é esta faixa larga. A
 * coleção que ainda não tem hero próprio continua funcionando com a capa.
 */
export function CapaColecao({ categoria, pecas }: CapaColecaoProps) {
  return (
    <section className="relative -mx-4 mb-2 flex h-[45svh] min-h-65 items-center justify-center overflow-hidden lg:-mx-12">
      <Image
        src={imagemCategoria(
          categoria.slug,
          categoria.imagem_hero ?? categoria.imagem_capa,
        )}
        alt=""
        fill
        priority
        // Mesma conta do hero da home, para uma faixa de 45svh: cobrir essa
        // altura com uma foto 3:2 pede 45 * 1.5 = 67.5vh de largura. Só passa
        // a ser a largura que manda quando a tela é mais larga que isso.
        sizes="(max-aspect-ratio: 27/40) 68vh, 100vw"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        // Ancorado acima do centro nos dois casos. A faixa é bem mais larga
        // que alta, então sobra pouco da altura da foto: centrado, o corte
        // passa na altura do queixo e decapita a modelo. Verificado na tela,
        // não suposto. Nos heros deitados 30% ainda deixa aparecer o vestido;
        // nas capas de alguém em pé o topo é a única âncora que salva o rosto.
        className={cn(
          "object-cover",
          categoria.imagem_hero ? "object-[center_30%]" : "object-top",
        )}
      />

      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <h1 className="font-display text-display-lg leading-none tracking-default text-ink-inverse">
          {categoria.nome}
        </h1>
        <p className="text-2xs tracking-caps uppercase text-ink-inverse">
          {pecas === 1 ? "1 vestido" : `${pecas} vestidos`}
        </p>
      </div>
    </section>
  );
}
