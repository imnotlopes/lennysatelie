import Image from "next/image";
import { Faixa } from "@/components/home/faixa";
import { imagemCategoria } from "@/lib/images";
import { getCategorias } from "@/lib/queries";

/**
 * As capas das coleções passando devagar.
 *
 * Cada capa leva o nome escrito em cima, como no site. A primeira versão era
 * só a foto, e sem o nome a fileira virava enfeite: seis vestidos bonitos que
 * não dizem que existe uma coleção de noiva bordada e outra de debutante. O
 * nome é o que transforma olhar em clique.
 *
 * Cada capa leva para a coleção no acervo, no domínio principal — esta página
 * mora em outro subdomínio, então o endereço precisa ser absoluto.
 *
 * Server Component: as capas chegam renderizadas do servidor, e o único
 * JavaScript é o da `Faixa`, que cuida de pausar.
 */
export async function FaixaColecoes({ site }: { site: string }) {
  const categorias = await getCategorias();
  if (!categorias.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-center text-2xs tracking-caps uppercase text-ink-muted">
        As coleções
      </h2>

      <Faixa rotulo="Coleções do ateliê" segundos={34}>
        {categorias.map((c) => (
          <div key={c.id} className="faixa_item">
            <a
              href={`${site}/acervo?categoria=${c.slug}`}
              className="group relative block w-38 overflow-hidden bg-surface-alt sm:w-44"
            >
              <span className="relative block aspect-3/4">
                <Image
                  src={imagemCategoria(c.slug, c.imagem_capa)}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 220px, 190px"
                  className="object-cover object-top transition-opacity duration-300 ease-brand group-hover:opacity-85"
                />

                {/* O mesmo véu do site. Sem ele o nome some sobre capa clara —
                    e metade das capas do ateliê é vestido branco em parede
                    branca. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/30"
                />

                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4">
                  {/* `text-base` e não `text-lg`: o card daqui tem um terço da
                      largura do card do site, e "Debutantes e damas" vazava
                      pela borda direita. Medido. */}
                  <span className="font-display text-base leading-tight tracking-default text-ink-inverse uppercase">
                    {c.nome}
                  </span>
                  <span className="border-b border-ink-inverse pb-1 text-2xs tracking-caps uppercase text-ink-inverse">
                    Ver todos
                  </span>
                </span>
              </span>
            </a>
          </div>
        ))}
      </Faixa>
    </section>
  );
}
