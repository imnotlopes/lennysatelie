import { notFound } from "next/navigation";
import { FormularioCupom } from "@/components/admin/formulario-cupom";
import { SITE } from "@/lib/admin/site";
import { getCupomPorId } from "@/lib/queries/admin";

export default async function EditarCupomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cupom = await getCupomPorId(id);
  if (!cupom) notFound();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          {cupom.codigo}
        </h1>
        <p className="text-xs text-ink-muted">
          {cupom.usos} aluguel(is) confirmado(s) até agora.
        </p>
      </header>

      <FormularioCupom
        site={SITE}
        cupomId={cupom.id}
        valoresIniciais={{
          codigo: cupom.codigo,
          influenciadoraNome: cupom.influenciadora_nome ?? "",
          influenciadoraInstagram: cupom.influenciadora_instagram ?? "",
          tipoDesconto: cupom.tipo_desconto,
          valor: cupom.valor,
          inicio: cupom.inicio,
          validade: cupom.validade,
          limiteUsos: cupom.limite_usos,
          ativo: cupom.ativo,
        }}
      />
    </main>
  );
}
