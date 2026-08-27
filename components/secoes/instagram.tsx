import Image from "next/image";
import { IconeInstagram } from "@/components/icons";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { BLUR_DATA_URL, FOTOS_INSTAGRAM } from "@/lib/images";
import type { Contato } from "@/lib/queries";
import { cn } from "@/lib/utils";

export interface SecaoInstagramProps {
  contato: Contato;
  semContainer?: boolean;
}

/**
 * "Conheça o Instagram".
 *
 * Os seis quadros são PLACEHOLDER: o site não busca posts do Instagram.
 * Puxar de verdade exige a Instagram Basic Display API, com app registrado
 * na Meta e token que expira a cada 60 dias — trabalho desproporcional para
 * um ateliê. Quando as fotos definitivas existirem, o caminho barato é a
 * Lennys escolher seis e subir como as demais.
 *
 * Cada quadro leva ao perfil, não a um post específico, justamente porque
 * não sabemos qual post é qual.
 */
export function SecaoInstagram({
  contato,
  semContainer = false,
}: SecaoInstagramProps) {
  const handle = contato.instagram?.trim();
  if (!handle) return null;

  const perfil = `https://instagram.com/${handle.replace("@", "")}`;

  const conteudo = (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Heading as={2} size="display-sm" revelar>
            Conheça o Instagram
          </Heading>
          <p className="text-xs text-ink-muted">
            Peças novas, bastidores e as noivas que passaram pelo ateliê.
          </p>
        </div>

        <a
          href={perfil}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ variant: "outline", size: "md" })}
        >
          <IconeInstagram />
          {handle}
        </a>
      </div>

      <ul className="grid grid-cols-3 gap-2 lg:grid-cols-6">
        {FOTOS_INSTAGRAM.map((foto) => (
          <li key={foto}>
            <a
              href={perfil}
              target="_blank"
              rel="noopener noreferrer"
              data-revelar="zoom"
              suppressHydrationWarning
              className="group relative block aspect-square overflow-hidden bg-surface-alt"
            >
              <Image
                src={foto}
                alt=""
                fill
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1025px) 16vw, 33vw"
                className="object-cover"
              />
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-ink/0 text-ink-inverse opacity-0",
                  "transition-all duration-200 ease-brand",
                  "group-hover:bg-ink/35 group-hover:opacity-100",
                )}
              >
                <IconeInstagram className="size-5" />
              </span>
              <span className="sr-only">
                Ver o perfil {handle} no Instagram, abre em nova aba
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );

  if (semContainer) {
    return (
      <section className="flex flex-col gap-6 border-t border-line pt-12">
        {conteudo}
      </section>
    );
  }

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      {conteudo}
    </Container>
  );
}
