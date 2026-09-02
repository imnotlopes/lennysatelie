import { PainelMidias } from "@/components/admin/painel-midias";
import { getTodasMidias } from "@/lib/queries";

export const metadata = { title: "Imagens do site | Painel Lennys Ateliê" };

export default async function ImagensPage() {
  const midias = await getTodasMidias();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Imagens do site
        </h1>
        <p className="max-w-prose text-xs text-ink-muted">
          As fotos e vídeos que aparecem na página inicial. O que você mudar
          aqui aparece no site na hora.
        </p>
      </header>

      <PainelMidias midias={midias} />
    </main>
  );
}
