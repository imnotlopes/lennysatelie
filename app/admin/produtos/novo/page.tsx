import { FormularioProduto } from "@/components/admin/formulario-produto";
import { PRODUTO_VAZIO } from "@/lib/admin/valores-iniciais";
import { getEtiquetas } from "@/lib/queries";
import { getCategoriasAdmin, getProdutosAdmin } from "@/lib/queries/admin";
import { exigirSessao } from "@/lib/admin/sessao";

export default async function NovoProdutoPage() {
  await exigirSessao();

  const [categorias, produtos, etiquetas] = await Promise.all([
    getCategoriasAdmin(),
    getProdutosAdmin(),
    getEtiquetas(),
  ]);

  const cores = [
    ...new Set(
      produtos.map((p) => p.cor).filter((c): c is string => Boolean(c)),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Novo vestido
        </h1>
        <p className="text-xs text-ink-muted">
          Só o nome é obrigatório. O resto pode preencher depois.
        </p>
      </header>

      <FormularioProduto
        categorias={categorias}
        coresExistentes={cores}
        etiquetas={etiquetas.map((e) => e.texto)}
        valoresIniciais={PRODUTO_VAZIO}
      />
    </main>
  );
}
