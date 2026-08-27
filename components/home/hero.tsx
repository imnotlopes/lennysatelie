import Image from "next/image";
import Link from "next/link";
import { estilosBotao } from "@/components/ui";
import hero1 from "@/public/fotos/hero-1.webp";
import hero2 from "@/public/fotos/hero-2.webp";
import hero3 from "@/public/fotos/hero-3.webp";

/**
 * Hero em altura de viewport, revezando entre três fotos.
 *
 * As imagens são importadas estaticamente, então o Next gera o `blurDataURL`
 * sozinho e conhece as dimensões em tempo de build.
 *
 * Só a primeira leva `priority`: ela é o LCP da home. As outras duas entram
 * depois, sem disputar banda com a que a visitante está vendo.
 *
 * O revezamento é CSS puro — ver `.hero-foto` em globals.css. Sem estado, sem
 * componente cliente e sem risco de hidratação.
 */
const FOTOS = [hero1, hero2, hero3];

export function Hero() {
  // O -mt-16 puxa o hero para debaixo do header sticky (h-16 = 80px), que e o
  // que permite o header ficar transparente por cima da imagem.
  return (
    <section className="relative -mt-16 flex h-[100svh] min-h-125 items-center justify-center overflow-hidden">
      {FOTOS.map((foto, indice) => (
        <Image
          key={foto.src}
          src={foto}
          alt=""
          fill
          priority={indice === 0}
          loading={indice === 0 ? undefined : "eager"}
          placeholder="blur"
          sizes="100vw"
          className="hero-foto object-cover"
        />
      ))}

      {/* Véu escuro sutil, só o suficiente para o texto passar em AA. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="font-display text-display-lg leading-tight tracking-default text-ink-inverse">
          Lennys Ateliê
        </h1>
        <p className="max-w-prose text-sm leading-base text-ink-inverse">
          Vestidos de festa para alugar, escolhidos peça por peça.
        </p>
        <Link
          href="/acervo"
          className={estilosBotao({ variant: "inverse", size: "lg" })}
        >
          Conheça o acervo
        </Link>
      </div>
    </section>
  );
}
