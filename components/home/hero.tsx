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
    <section className="relative -mt-16 flex h-[100svh] min-h-125 items-center overflow-hidden">
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
          // Só a primeira tem prioridade: ela é o LCP da home. As outras
          // carregam em prioridade normal, e não `eager` como antes — cada
          // uma só entra em cena 6 segundos depois da anterior, tempo de
          // sobra. Com uma foto no hero o `eager` não custava nada; quando a
          // dona pôs três pelo painel, virou 377KB baixados de uma vez antes
          // de qualquer outra coisa da página. Medido.
          priority={indice === 0}
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
            reveza ? ({ "--i": indice } as React.CSSProperties) : { opacity: 1 }
          }
          className="hero-foto object-cover"
        />
      ))}

      {/* Véu escuro sutil, só o suficiente para o texto passar em AA. */}
      {/* Véu mais forte à esquerda, onde o texto fica, e quase transparente à
          direita, onde só há foto. Um véu chapado escurece o vestido inteiro
          para proteger um texto que ocupa um terço da tela. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/25"
      />

      {/* Alinhado à esquerda, e não centrado. Centrado, os três blocos têm o
          mesmo peso e o olho não sabe por onde começar; encostados na margem
          eles viram uma coluna que se lê de cima para baixo.

          `hero-entra` escalona a entrada: rótulo, título, traço, texto e botão
          aparecem em sequência, na ordem em que se lê. */}
      <div className="hero-entra relative z-10 mx-auto flex w-full max-w-content flex-col items-start gap-5 px-4 lg:px-12">
        <span className="text-2xs tracking-caps uppercase text-ink-inverse/80">
          Jandira, São Paulo
        </span>

        <h1 className="max-w-2xl font-display text-display-lg leading-tight tracking-default text-ink-inverse text-balance">
          Vestidos de noiva e de festa para alugar
        </h1>

        <span aria-hidden="true" className="filete" />

        <p className="max-w-md text-sm leading-base text-ink-inverse/85">
          Noiva, casamento civil, cerimônia e festa. Prova com horário marcado e
          ajuste feito no seu corpo.
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
