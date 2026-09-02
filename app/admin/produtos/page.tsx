import Link from "next/link";
import { estilosBotao } from "@/components/ui";
import { TabelaProdutos } from "@/components/admin/tabela-produtos";
import { getEtiquetas } from "@/lib/queries";
import { getCategoriasAdmin, getProdutosAdmin } from "@/lib/queries/admin";

export default async function ProdutosAdminPage() {
  const [produtos, categorias, etiquetas] = await Promise.all([
    getProdutosAdmin(),
    getCategoriasAdmin(),
    getEtiquetas(),
  ]);

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-sm leading-tight text-ink">
            Vestidos
          </h1>
          <p className="text-xs text-ink-muted">
            Ligue, desligue e etiquete direto na tabela. A mudança vale no
            site na hora.
          </p>
        </div>

        <Link
          href="/admin/produtos/novo"
          className={estilosBotao()}
        >
          Novo vestido
        </Link>
      </header>

      <TabelaProdutos
        produtos={produtos}
        categorias={categorias}
        etiquetas={etiquetas.map((e) => e.texto)}
      />
    </main>
  );
}
