import { FormularioCupom } from "@/components/admin/formulario-cupom";
import { SITE } from "@/lib/admin/site";
import { exigirSessao } from "@/lib/admin/sessao";

export default async function NovoCupomPage() {
  await exigirSessao();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Novo cupom
        </h1>
        <p className="text-xs text-ink-muted">
          Depois de criar, o link e a mensagem prontos aparecem aqui embaixo.
        </p>
      </header>

      <FormularioCupom
        site={SITE}
        valoresIniciais={{
          codigo: "",
          influenciadoraNome: "",
          influenciadoraInstagram: "",
          tipoDesconto: "percentual",
          valor: 10,
          inicio: null,
          validade: null,
          limiteUsos: null,
          ativo: true,
        }}
      />
    </main>
  );
}
