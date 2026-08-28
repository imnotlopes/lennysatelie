import Image from "next/image";
import { IconeInstagram } from "@/components/icons";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { REELS } from "@/lib/feedbacks";
import { BLUR_DATA_URL } from "@/lib/images";
import type { Contato } from "@/lib/queries";

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
 */
export function SecaoVideos({ contato }: SecaoVideosProps) {
  if (!REELS.length) return null;

  const handle = contato.instagram?.trim();
  const perfil = handle
    ? `https://instagram.com/${handle.replace("@", "")}`
    : null;

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Heading as={2} size="display-sm" revelar>
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

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {REELS.map((reel, indice) => (
          <li key={reel.url}>
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-9/16 overflow-hidden bg-surface-alt"
            >
              <Image
                src={reel.capa}
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
                {reel.descricao} {indice + 1}, abre em nova aba
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
