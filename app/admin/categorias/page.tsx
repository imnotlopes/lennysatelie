import { PainelCategorias } from "@/components/admin/painel-categorias";
import { getCategoriasComTotal } from "@/lib/queries/admin";
import { exigirSessao } from "@/lib/admin/sessao";

export default async function CategoriasPage() {
  await exigirSessao();

  const categorias = await getCategoriasComTotal();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Coleções
        </h1>
        <p className="max-w-prose text-xs text-ink-muted">
          Coleção com vestido dentro não pode ser apagada — as peças ficariam
          soltas e sumiriam dos filtros do acervo.
        </p>
      </header>

      <PainelCategorias categorias={categorias} />
    </main>
  );
}
