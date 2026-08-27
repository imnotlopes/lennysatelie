import Link from "next/link";
import { estilosBotao } from "@/components/ui";
import { TabelaCupons } from "@/components/admin/tabela-cupons";
import { getCuponsComMetrica } from "@/lib/queries/admin";

export default async function CuponsPage() {
  const cupons = await getCuponsComMetrica();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-sm leading-tight text-ink">
            Cupons
          </h1>
          <p className="max-w-prose text-xs text-ink-muted">
            Visitas são quantas pessoas chegaram pelo link. Cliques são quantas
            foram para o WhatsApp. Alugados é você quem marca, quando o aluguel
            se confirma.
          </p>
        </div>

        <Link
          href="/admin/cupons/novo"
          className={estilosBotao()}
        >
          Novo cupom
        </Link>
      </header>

      <TabelaCupons cupons={cupons} />
    </main>
  );
}
