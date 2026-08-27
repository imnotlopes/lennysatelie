import { FormularioConfiguracoes } from "@/components/admin/formulario-configuracoes";
import { getConfiguracoes } from "@/lib/queries";

export default async function ConfiguracoesPage() {
  const { contato, whatsappTemplate } = await getConfiguracoes();

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Configurações
        </h1>
        <p className="text-xs text-ink-muted">
          O que muda aqui aparece no site inteiro: rodapé, botões e mensagens.
        </p>
      </header>

      <FormularioConfiguracoes
        valoresIniciais={{
          whatsapp: contato.whatsapp,
          telefone: contato.telefone,
          email: contato.email,
          endereco: contato.endereco,
          instagram: contato.instagram,
          facebook: contato.facebook,
          template: whatsappTemplate.mensagem,
        }}
      />
    </main>
  );
}
