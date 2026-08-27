"use client";

import { useState } from "react";
import { estilosBotao } from "@/components/ui";
import { descontoLegivel, situacaoCupom } from "@/lib/cupom";
import type { CupomPublico } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface EntregaCupomProps {
  cupom: Pick<
    CupomPublico,
    | "codigo"
    | "tipo_desconto"
    | "valor"
    | "ativo"
    | "inicio"
    | "validade"
    | "limite_usos"
    | "usos"
  > & { influenciadora_nome: string | null };
  /** Domínio do site, sem barra no fim. */
  site: string;
}

/**
 * O entregável da tela de cupom: o link e a mensagem prontos para enviar.
 *
 * Fica em destaque, logo abaixo do formulário, porque é o que a dona
 * efetivamente leva daqui — o resto é cadastro. Enterrar isso no rodapé
 * significaria fazer ela montar o link à mão toda vez.
 */
export function EntregaCupom({ cupom, site }: EntregaCupomProps) {
  const situacao = situacaoCupom(cupom);
  const link = `${site}/acervo?cupom=${cupom.codigo}`;
  const nome = cupom.influenciadora_nome?.trim() || "tudo bem";

  const mensagem =
    `Oi ${nome}! Esse é o seu link exclusivo do Lennys Ateliê: ${link}. ` +
    `Quem entrar por ele ganha ${descontoLegivel(cupom)} de desconto ` +
    `em qualquer vestido do acervo.`;

  return (
    <section className="flex flex-col gap-4 border-2 border-accent bg-surface-alt p-5 lg:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg leading-tight text-ink">
          Pronto para enviar
        </h2>
        <p className="text-2xs text-ink-muted">
          Copie e mande para a influenciadora. Quem entrar por este link vê o
          desconto aplicado no site inteiro.
        </p>
      </div>

      <CampoCopiavel rotulo="Link exclusivo" valor={link} />
      <CampoCopiavel rotulo="Mensagem pronta" valor={mensagem} multilinha />

      {/* Mandar o link de um cupom que não está valendo é o erro mais caro
          possível aqui: a influenciadora publica e ninguém percebe. */}
      {situacao.estado !== "valendo" ? (
        <p className="text-2xs text-error" role="alert">
          Atenção: este cupom não está valendo agora ({situacao.rotulo}
          {situacao.detalhe ? ` — ${situacao.detalhe.toLowerCase()}` : ""}).
          Quem entrar pelo link não vai ver desconto nenhum.
        </p>
      ) : null}
    </section>
  );
}

function CampoCopiavel({
  rotulo,
  valor,
  multilinha = false,
}: {
  rotulo: string;
  valor: string;
  multilinha?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Navegador sem permissão de área de transferência: o texto continua
      // selecionável na tela, então dá para copiar à mão.
      setCopiado(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xs tracking-caps uppercase text-ink-muted">
        {rotulo}
      </span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {multilinha ? (
          <p className="flex-1 border border-line bg-surface-raised p-3 text-xs leading-base text-ink">
            {valor}
          </p>
        ) : (
          <p className="flex-1 truncate border border-line bg-surface-raised p-3 text-xs text-ink">
            {valor}
          </p>
        )}

        <button
          type="button"
          onClick={copiar}
          aria-live="polite"
          className={estilosBotao({
            variant: copiado ? "outline" : "primary",
            size: "lg",
            // Copiado troca para o verde de estado, que nao e uma variante do
            // sistema: e sinal de confirmacao, nao um tipo de botao.
            className: cn("shrink-0", copiado && "border-success text-success"),
          })}
        >
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
