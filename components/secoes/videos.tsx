import Image from "next/image";
import { Esteira } from "@/components/home/esteira";
import { IconeInstagram } from "@/components/icons";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { BLUR_DATA_URL, urlDaMidia } from "@/lib/images";
import { getMidias } from "@/lib/queries";
import type { Contato } from "@/lib/queries";
import type { Midia } from "@/lib/supabase/types";

/**
 * Quanto tempo cada vídeo fica na tela antes de dar a vez.
 *
 * Três segundos, um a mais que as capas de coleção. O triângulo de play
 * convida ao clique, e trocar o card debaixo do dedo abriria o reel errado.
 * A esteira para no toque, mas o segundo a mais dá folga antes disso.
 */
const MS_POR_VIDEO = 3000;

export interface SecaoVideosProps {
  contato: Contato;
}

/**
 * Vídeos do ateliê, com a miniatura aqui e o vídeo lá.
 *
 * O vídeo não toca no site de propósito. Embutir reel do Instagram exige o
 * script deles em toda visita: pesa, rastreia quem entrou e some se a
 * publicação for apagada. A miniatura foi baixada e é servida daqui — a URL
 * original do CDN do Instagram é assinada e expira em poucos dias.
 *
 * O quadro é 9:16 com o triângulo de play em cima, para ler como vídeo antes
 * de qualquer texto. Cada um abre o reel em aba nova.
 *
 * A fileira tem quatro lugares no desktop e dois no celular. Havendo mais
 * reels que lugares, eles passam pelos lugares — ver `Esteira`. Continua
 * Server Component: os cartões são montados aqui, e só a escolha de quais
 * aparecem roda no browser.
 */
export async function SecaoVideos({ contato }: SecaoVideosProps) {
  const reels = await getMidias("reel");
  if (!reels.length) return null;

  const handle = contato.instagram?.trim();
  const perfil = handle
    ? `https://instagram.com/${handle.replace("@", "")}`
    : null;

  return (
    <section className="bg-surface-alt">
      <Container as="section" className="folha gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Heading
              as={2}
              size="display-sm"
              revelar
              rotulo="No Instagram"
              filete
            >
              Veja em movimento
            </Heading>
            <p className="max-w-prose text-xs text-ink-muted">
              Nenhuma foto mostra o caimento de um vestido como ele andando.
            </p>
          </div>

          {perfil ? (
            <a
              href={perfil}
              target="_blank"
              rel="noopener noreferrer"
              className={estilosBotao({ variant: "outline", size: "md" })}
            >
              <IconeInstagram />
              {handle}
            </a>
          ) : null}
        </div>

        <Esteira
          itens={reels.map((reel, indice) => ({
            chave: reel.id,
            rotulo: `Ver o vídeo ${indice + 1} do ateliê`,
            conteudo: <Reel reel={reel} indice={indice} />,
          }))}
          lugares={{ base: 2, lg: 4 }}
          ms={MS_POR_VIDEO}
          classeFileira="grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        />
      </Container>
    </section>
  );
}

/**
 * Uma miniatura, abrindo o reel em aba nova.
 *
 * O rótulo diz para onde vai e que sai do site: a imagem é decorativa e o
 * link não tem texto visível, então sem ele o leitor de tela anunciaria só
 * "link".
 */
function Reel({ reel, indice }: { reel: Midia; indice: number }) {
  return (
    <a
      href={reel.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-9/16 overflow-hidden bg-surface-alt"
    >
      <Image
        src={urlDaMidia(reel.arquivo)}
        alt=""
        fill
        loading="lazy"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes="(min-width: 1025px) 22vw, 45vw"
        className="object-cover transition-opacity duration-300 ease-brand group-hover:opacity-85"
      />

      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-ink/55 backdrop-blur-sm transition-colors duration-200 ease-brand group-hover:bg-ink/75">
          <svg
            viewBox="0 0 24 24"
            className="size-4 translate-x-px fill-ink-inverse"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>

      <span className="sr-only">
        Vídeo {indice + 1} do ateliê no Instagram, abre em nova aba
      </span>
    </a>
  );
}
