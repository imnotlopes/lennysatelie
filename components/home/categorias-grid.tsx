import { CapasColecoes } from "@/components/home/capas-colecoes";
import { Container, Heading } from "@/components/ui";
import { imagemCategoria } from "@/lib/images";
import { getCategorias } from "@/lib/queries";

/**
 * As coleções, em capas grandes.
 *
 * Server Component: busca as coleções e entrega prontas ao componente de
 * cliente, que só cuida do revezamento no celular. A lista chega renderizada
 * do servidor, então o Google vê as cinco coleções mesmo com o JavaScript
 * desligado.
 */
export async function CategoriasGrid() {
  const categorias = await getCategorias();
  if (!categorias.length) return null;

  const capas = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    slug: c.slug,
    imagem: imagemCategoria(c.slug, c.imagem_capa),
  }));

  return (
    <Container as="section" className="flex flex-col gap-6 py-12">
      <Heading as={2} size="display-sm" revelar>
        Escolha por estilo
      </Heading>

      <CapasColecoes capas={capas} />
    </Container>
  );
}
