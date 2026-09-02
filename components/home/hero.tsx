import Image from "next/image";
import Link from "next/link";
import { estilosBotao } from "@/components/ui";
import { BLUR_DATA_URL, urlDaMidia } from "@/lib/images";
import { getMidias } from "@/lib/queries";

/** Segundos que cada foto fica na tela antes de passar a vez. */
const SEGUNDOS_POR_FOTO = 6;

/**
 * O revezamento, calculado para a quantidade de fotos que existir.
 *
 * Precisa ser gerado aqui e não em globals.css porque a quantidade vem do
 * painel: os percentuais do quadro-chave dependem dela. A versão anterior era
 * fixa em três, e ao desligar uma sobrava uma janela de seis segundos com o
 * hero vazio — só o véu escuro sobre nada. Isso foi medido, não suposto.
 *
 * Como funciona: o ciclo dura `n * 6s` e cada foto entra com `i * 6s` de
 * atraso. Dentro do próprio ciclo, cada uma sobe de 0 a 1 nos primeiros 4%,
 * fica em 1 até a sua fatia acabar, e desce nos 4% seguintes — que são
 * exatamente os 4% em que a seguinte está subindo. Uma cobre a outra, e a
 * soma nunca chega a zero.
 *
 * É markup estático: nada disso vira JavaScript no navegador.
 */
function cssDoRevezamento(quantas: number): string {
  const fatia = 100 / quantas;
  const saida = Math.min(fatia + 4, 100);

  return `
@keyframes hero-reveza {
  0% { opacity: 0 }
  4% { opacity: 1 }
  ${fatia.toFixed(3)}% { opacity: 1 }
  ${saida.toFixed(3)}% { opacity: 0 }
  100% { opacity: 0 }
}
.hero-foto {
  animation: hero-reveza ${quantas * SEGUNDOS_POR_FOTO}s infinite;
  animation-delay: calc(var(--i) * ${SEGUNDOS_POR_FOTO}s);
}`;
}

/**
 * Hero em altura de viewport, revezando entre as fotos do painel.
 *
 * A dona troca as fotos sem precisar de deploy. Sem nenhuma cadastrada, o hero
 * renderiza só o texto sobre o fundo escuro — feio, mas não quebrado, e o
 * painel avisa que falta imagem.
 *
 * Só a primeira leva `priority`: ela é o LCP da home. As outras entram depois,
 * sem disputar banda com a que a visitante está vendo.
 */
export async function Hero() {
  const fotos = await getMidias("hero");

  // Com uma foto só não há revezamento: a animação fica de fora e ela aparece
  // direto. Injetar o quadro-chave nesse caso só faria a única foto piscar.
  const reveza = fotos.length > 1;

  return (
    <section className="relative -mt-16 flex h-[100svh] min-h-125 items-center justify-center overflow-hidden">
      {/* O -mt-16 puxa o hero para debaixo do header sticky (h-16 = 80px), que
          é o que permite o header ficar transparente por cima da imagem. */}
      {reveza ? (
        <style
          dangerouslySetInnerHTML={{ __html: cssDoRevezamento(fotos.length) }}
        />
      ) : null}

      {fotos.map((foto, indice) => (
        <Image
          key={foto.id}
          src={urlDaMidia(foto.arquivo)}
          alt=""
          fill
          priority={indice === 0}
          loading={indice === 0 ? undefined : "eager"}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          // Não é "100vw". A caixa ocupa a tela inteira e o corte é por
          // cobertura: numa tela vertical, uma foto deitada precisa ser bem
          // mais larga que a tela para preencher a altura. Com 100vw o
          // navegador buscava 750px para cobrir uma caixa que pedia 1218 —
          // medido, e a foto saía borrada no celular.
          //
          // 150vh é a largura que uma foto 3:2 precisa ter para cobrir a
          // altura da tela. Acima dessa proporção quem manda é a largura, e aí
          // 100vw volta a ser a conta certa.
          sizes="(max-aspect-ratio: 3/2) 150vh, 100vw"
          style={
            reveza
              ? ({ "--i": indice } as React.CSSProperties)
              : { opacity: 1 }
          }
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
