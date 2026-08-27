import { PainelCategorias } from "@/components/admin/painel-categorias";
import { getCategoriasComTotal } from "@/lib/queries/admin";

export default async function CategoriasPage() {
  const categorias = await getCategoriasComTotal();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Categorias
        </h1>
        <p className="max-w-prose text-xs text-ink-muted">
          Categoria com vestido vinculado não pode ser apagada — as peças
          ficariam sem categoria e sumiriam dos filtros.
        </p>
      </header>

      <PainelCategorias categorias={categorias} />
    </main>
  );
}
