import { PainelEtiquetas } from "@/components/admin/painel-etiquetas";
import { getEtiquetasComUso } from "@/lib/queries";

export default async function EtiquetasPage() {
  const etiquetas = await getEtiquetasComUso();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Etiquetas
        </h1>
        <p className="max-w-prose text-xs text-ink-muted">
          O selo que aparece no canto da foto do vestido, no acervo. Aqui você
          monta a lista de sugestões; quem recebe o selo é cada vestido, na
          lista de vestidos.
        </p>
      </header>

      <PainelEtiquetas etiquetas={etiquetas} />
    </main>
  );
}
