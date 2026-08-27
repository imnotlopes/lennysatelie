import Image from "next/image";
import Link from "next/link";
import { Container, Heading } from "@/components/ui";
import { getCategorias } from "@/lib/queries";
import { BLUR_DATA_URL, imagemCategoria } from "@/lib/images";

/**
 * Grade de categorias.
 *
 * O prompt previa 4 cards; o banco tem 3 categorias cadastradas. A grade
 * acompanha a quantidade real em vez de fingir uma quarta, e o limite de 4
 * segue valendo caso a Lennys cadastre mais.
 */
export async function CategoriasGrid() {
  const categorias = (await getCategorias()).slice(0, 4);
  if (!categorias.length) return null;

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <Heading as={2} size="display-sm" revelar>
        Escolha por estilo
      </Heading>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            <Link
              href={`/acervo?categoria=${categoria.slug}`}
              className="group flex flex-col gap-2"
            >
              <div
                data-revelar="zoom"
                suppressHydrationWarning
                className="relative aspect-3/4 w-full overflow-hidden bg-surface-alt"
              >
                <Image
                  src={imagemCategoria(categoria.slug, categoria.imagem_capa)}
                  alt={`Vestidos ${categoria.nome.toLowerCase()}`}
                  fill
                  sizes="(min-width: 1025px) 25vw, 50vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-opacity duration-300 ease-brand group-hover:opacity-90"
                />
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 to-transparent p-3 font-display text-lg text-ink-inverse">
                  {categoria.nome}
                </span>
              </div>
              <span className="text-xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand group-hover:text-accent-ink">
                Ver todos
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
