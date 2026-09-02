import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioProduto } from "@/components/admin/formulario-produto";
import { produtoParaFormulario } from "@/lib/admin/valores-iniciais";
import { getEtiquetas } from "@/lib/queries";
import {
  getCategoriasAdmin,
  getProdutoAdminPorId,
  getProdutosAdmin,
} from "@/lib/queries/admin";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produto = await getProdutoAdminPorId(id);
  if (!produto) notFound();

  const [categorias, produtos, etiquetas] = await Promise.all([
    getCategoriasAdmin(),
    getProdutosAdmin(),
    getEtiquetas(),
  ]);

  const cores = [
    ...new Set(produtos.map((p) => p.cor).filter((c): c is string => Boolean(c))),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          {produto.nome}
        </h1>
        <Link
          href={`/acervo/${produto.slug}`}
          target="_blank"
          className="self-start text-2xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
        >
          Ver como fica no site
        </Link>
      </header>

      <FormularioProduto
        categorias={categorias}
        coresExistentes={cores}
        etiquetas={etiquetas.map((e) => e.texto)}
        produtoId={produto.id}
        valoresIniciais={produtoParaFormulario(produto)}
      />
    </main>
  );
}
