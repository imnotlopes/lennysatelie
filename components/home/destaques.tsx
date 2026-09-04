import { Container, Heading } from "@/components/ui";
import { getCupomAtivo, getProdutosDestaque } from "@/lib/queries";
import { Carrossel } from "./carrossel";
import { ProdutoCard } from "@/components/produto-card";

/** "Queridinhos do momento": carrossel com os produtos em destaque. */
export async function Destaques() {
  const [produtos, cupom] = await Promise.all([
    getProdutosDestaque(),
    getCupomAtivo(),
  ]);
  if (!produtos.length) return null;

  return (
    <section className="bg-surface-alt">
      <Container as="section" className="folha gap-6">
        <Heading
          as={2}
          size="display-sm"
          revelar
          rotulo="Seleção da semana"
          filete
        >
          Queridinhos do momento
        </Heading>

        <Carrossel rotulo="Queridinhos do momento">
          {produtos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              sizes="(min-width: 1025px) 25vw, 66vw"
              cupom={cupom}
            />
          ))}
        </Carrossel>
      </Container>
    </section>
  );
}
