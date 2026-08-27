"use client";

import { useState } from "react";
import { registrarCliqueWhatsapp } from "@/app/actions/produto";
import { IconeWhatsapp } from "@/components/icons";
import type { CupomPublico, ProdutoComCategoria } from "@/lib/supabase/types";
import { estilosBotao } from "@/components/ui";
import { linkWhatsapp, montarMensagem } from "@/lib/whatsapp";

export interface ReservaProps {
  produto: ProdutoComCategoria;
  /** URL absoluta da peça, para entrar na mensagem. */
  url: string;
  numeroWhatsapp: string;
  template: string;
  cupom?: CupomPublico | null;
}

/**
 * Bloco de reserva: tamanho, data e o botão do WhatsApp.
 *
 * Os campos existem para qualificar a conversa. Sem eles a dona do ateliê
 * recebe "oi, tenho interesse" e gasta três mensagens perguntando tamanho e
 * data — com eles, a primeira mensagem já traz as duas coisas.
 *
 * Cor não se pergunta: cada peça tem a sua, e um campo aberto só convida a
 * pedir o que o acervo não tem.
 *
 * Nenhum campo é obrigatório, de propósito: exigir preenchimento antes de
 * falar com alguém é a forma mais rápida de perder a cliente que só quer
 * tirar uma dúvida. Quem preencher, ajuda; quem não preencher, conversa
 * assim mesmo.
 *
 * O link é montado a cada tecla e o `<a>` continua sendo um link de verdade,
 * então o WhatsApp abre pela navegação nativa — nada de `window.open`, que o
 * bloqueador de pop-up derruba.
 */
export function Reserva({
  produto,
  url,
  numeroWhatsapp,
  template,
  cupom,
}: ReservaProps) {
  const [tamanho, setTamanho] = useState("");
  const [data, setData] = useState("");

  const mensagem = montarMensagem(produto, {
    url,
    template,
    cupom,
    reserva: { tamanho, data },
  });

  const href = linkWhatsapp(numeroWhatsapp, mensagem);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-5">
      <p className="text-2xs tracking-caps uppercase text-ink-muted">
        Faça sua reserva pelo WhatsApp
      </p>

      {/* Tamanho: chips quando a peça tem tamanhos cadastrados, campo livre
          quando não tem. Hoje a maioria do acervo ainda está sem. */}
      {produto.tamanho.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs text-ink">Qual tamanho você quer?</legend>
          <div className="flex flex-wrap gap-2">
            {produto.tamanho.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tamanho === t}
                onClick={() => setTamanho(tamanho === t ? "" : t)}
                className={estilosBotao({
                  variant: tamanho === t ? "primary" : "outline",
                  size: "md",
                  className: "min-w-9",
                })}
              >
                {t}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <Campo
          id="reserva-tamanho"
          rotulo="Qual tamanho você quer?"
          dica="Se não souber, pode deixar em branco que a gente ajuda."
          valor={tamanho}
          aoMudar={setTamanho}
          placeholder="Ex.: M, ou 42"
        />
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="reserva-data" className="text-xs text-ink">
          Para que dia é?
        </label>
        <input
          id="reserva-data"
          type="date"
          min={hoje}
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="h-11 w-full rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink transition-colors duration-200 ease-brand focus:border-ink focus:outline-none"
        />
        <p className="text-2xs text-ink-muted">
          A data ajuda a saber se a peça está livre.
        </p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void registrarCliqueWhatsapp(produto.id, cupom?.id);
        }}
        className={estilosBotao({ size: "xl", className: "w-full" })}
      >
        <IconeWhatsapp className="size-4" />
        Reservar pelo WhatsApp
      </a>

      <p className="text-2xs leading-base text-ink-muted">
        A reserva é confirmada com 40% do valor. Os outros 60% você paga até
        a data da retirada.
      </p>
    </div>
  );
}

function Campo({
  id,
  rotulo,
  dica,
  valor,
  aoMudar,
  placeholder,
}: {
  id: string;
  rotulo: string;
  dica: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink">
        {rotulo}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        placeholder={placeholder}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-11 w-full rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink transition-colors duration-200 ease-brand focus:border-ink focus:outline-none"
      />
      <p className="text-2xs text-ink-muted">{dica}</p>
    </div>
  );
}
