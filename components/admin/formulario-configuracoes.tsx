"use client";

import { useState, useTransition } from "react";
import {
  salvarConfiguracoes,
  type DadosConfiguracoes,
} from "@/app/actions/admin-geral";
import { useToast } from "@/components/admin/toast";
import { Button, Input, Textarea } from "@/components/ui";
import { SITE } from "@/lib/admin/site";
import { linkWhatsapp, montarMensagem } from "@/lib/whatsapp";
import type { ProdutoComCategoria } from "@/lib/supabase/types";

/** Peça fictícia só para o preview. Não vai para lugar nenhum. */
const EXEMPLO = {
  id: "exemplo",
  nome: "Vestido Isla",
  slug: "vestido-isla",
  descricao: null,
  preco_locacao: 729,
  preco_original: null,
  tamanho: ["M"],
  cor: "Azul royal",
  categoria_id: null,
  imagens: [],
  destaque: false,
  ativo: true,
  ordem: 1,
  created_at: "",
  categoria: null,
} as unknown as ProdutoComCategoria;

const VARIAVEIS = [
  ["{nome}", "nome do vestido"],
  ["{preco}", "valor, já com desconto de cupom se houver"],
  ["{url}", "link da página do vestido"],
  ["{cupom}", "código do cupom, quando houver"],
] as const;

export function FormularioConfiguracoes({
  valoresIniciais,
}: {
  valoresIniciais: DadosConfiguracoes;
}) {
  const { avisar } = useToast();
  const [dados, setDados] = useState(valoresIniciais);
  const [salvando, iniciar] = useTransition();

  function campo<K extends keyof DadosConfiguracoes>(
    chave: K,
    valor: DadosConfiguracoes[K],
  ) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  const previa = montarMensagem(EXEMPLO, {
    url: `${SITE}/acervo/vestido-isla`,
    template: dados.template,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        iniciar(async () => {
          const r = await salvarConfiguracoes(dados);
          avisar(
            r.ok ? "Configurações salvas." : (r.erro ?? "Não foi possível salvar."),
            r.ok ? "sucesso" : "erro",
          );
        });
      }}
      className="flex max-w-200 flex-col gap-8"
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-bold tracking-default text-ink">Contato</h2>

        <Input
          id="whatsapp"
          label="WhatsApp"
          hint="Só números, com o código do país. Ex.: 5511958564840. É para cá que toda conversa do site vai."
          value={dados.whatsapp}
          onChange={(e) => campo("whatsapp", e.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="telefone"
            label="Telefone para exibir"
            hint="Como aparece no rodapé. Ex.: (11) 95856-4840"
            value={dados.telefone}
            onChange={(e) => campo("telefone", e.target.value)}
          />
          <Input
            id="email"
            type="email"
            label="E-mail"
            value={dados.email}
            onChange={(e) => campo("email", e.target.value)}
          />
        </div>

        <Input
          id="endereco"
          label="Endereço"
          value={dados.endereco}
          onChange={(e) => campo("endereco", e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="instagram"
            label="Instagram"
            hint="Com arroba. Ex.: @lennys_atelie"
            value={dados.instagram}
            onChange={(e) => campo("instagram", e.target.value)}
          />
          <Input
            id="facebook"
            label="Facebook"
            hint="Endereço completo. Deixe em branco para esconder o ícone."
            value={dados.facebook}
            onChange={(e) => campo("facebook", e.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-bold tracking-default text-ink">
            Mensagem do WhatsApp
          </h2>
          <p className="text-2xs text-ink-muted">
            É o texto que já chega digitado quando a cliente clica em reservar.
          </p>
        </div>

        <Textarea
          id="template"
          label="Texto da mensagem"
          rows={3}
          value={dados.template}
          onChange={(e) => campo("template", e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-2xs tracking-caps uppercase text-ink-muted">
            O que você pode usar
          </span>
          <ul className="flex flex-col gap-1">
            {VARIAVEIS.map(([chave, explicacao]) => (
              <li key={chave} className="flex flex-wrap items-baseline gap-2">
                <button
                  type="button"
                  onClick={() => campo("template", `${dados.template} ${chave}`)}
                  className="border border-line-strong px-2 py-0.5 text-2xs text-ink transition-colors hover:border-accent-ink hover:text-accent-ink"
                >
                  {chave}
                </button>
                <span className="text-2xs text-ink-muted">{explicacao}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border border-accent bg-surface-alt p-4">
          <span className="text-2xs tracking-caps uppercase text-ink-muted">
            Como vai chegar
          </span>
          <p className="text-xs leading-base whitespace-pre-line text-ink">
            {previa}
          </p>
          <a
            href={linkWhatsapp(dados.whatsapp, previa)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-2xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
          >
            Testar no WhatsApp
          </a>
        </div>
      </section>

      <div className="border-t border-line pt-6">
        <Button type="submit" loading={salvando}>
          Salvar configurações
        </Button>
      </div>
    </form>
  );
}
