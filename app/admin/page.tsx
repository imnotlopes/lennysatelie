import Link from "next/link";
import { Cartao } from "@/components/admin/cartao";
import { GraficoCliques } from "@/components/admin/grafico-cliques";
import { getResumoPainel } from "@/lib/queries/analytics";

export default async function DashboardPage() {
  const resumo = await getResumoPainel();

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Resultados
        </h1>
        <p className="text-xs text-ink-muted">Últimos 30 dias.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao rotulo="Vestidos no ar" valor={resumo.produtosAtivos} />
        <Cartao
          rotulo="Cliques no WhatsApp"
          valor={resumo.cliquesWhatsapp}
          detalhe="Quantas conversas o site abriu"
        />
        <Cartao
          rotulo="Visitas a vestidos"
          valor={resumo.visitasProduto}
          detalhe="Páginas de peça abertas"
        />
        <Cartao
          rotulo="Cupom que mais trouxe"
          valor={resumo.cupomDestaque?.codigo ?? "—"}
          detalhe={
            resumo.cupomDestaque
              ? `${resumo.cupomDestaque.cliques} clique${resumo.cupomDestaque.cliques === 1 ? "" : "s"}${
                  resumo.cupomDestaque.influenciadora
                    ? ` · ${resumo.cupomDestaque.influenciadora}`
                    : ""
                }`
              : "Nenhum cupom usado ainda"
          }
        />
      </section>

      {resumo.vazio ? (
        <EstadoVazio />
      ) : (
        <>
          <section className="flex flex-col gap-3 border border-line bg-surface-raised p-4 lg:p-6">
            <h2 className="text-xs font-bold tracking-default text-ink">
              Cliques no WhatsApp por dia
            </h2>
            <GraficoCliques dados={resumo.porDia} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-bold tracking-default text-ink">
              Vestidos mais vistos
            </h2>

            {resumo.ranking.length === 0 ? (
              <p className="text-xs text-ink-muted">
                Ainda não houve visita a nenhuma peça no período.
              </p>
            ) : (
              <div className="overflow-x-auto border border-line bg-surface-raised">
                <table className="w-full min-w-96 text-left">
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="p-3 text-2xs tracking-caps uppercase text-ink-muted">
                        Vestido
                      </th>
                      <th scope="col" className="p-3 text-2xs tracking-caps uppercase text-ink-muted">
                        Visitas
                      </th>
                      <th scope="col" className="p-3 text-2xs tracking-caps uppercase text-ink-muted">
                        Cliques
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.ranking.map((item) => (
                      <tr key={item.produtoId} className="border-b border-line last:border-0">
                        <td className="p-3 text-xs text-ink">
                          <Link
                            href={`/acervo/${item.slug}`}
                            className="transition-colors duration-200 ease-brand hover:text-accent-ink"
                          >
                            {item.nome}
                          </Link>
                        </td>
                        <td className="p-3 text-xs text-ink">{item.visitas}</td>
                        <td className="p-3 text-xs text-ink">{item.cliques}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function EstadoVazio() {
  return (
    <section className="flex flex-col gap-2 border border-line bg-surface-alt p-8">
      <h2 className="font-display text-lg leading-tight text-ink">
        Ainda não há movimento para mostrar
      </h2>
      <p className="max-w-prose text-xs leading-base text-ink-muted">
        Os números aparecem sozinhos conforme as clientes visitam o site e
        clicam para falar no WhatsApp. Nada precisa ser configurado.
      </p>
    </section>
  );
}
