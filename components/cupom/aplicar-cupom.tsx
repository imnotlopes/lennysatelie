"use client";

import { useRef, useState, useTransition } from "react";
import { aplicarCupom } from "@/app/actions/cupom";
import { IconeEtiqueta } from "@/components/icons";
import { estilosBotao } from "@/components/ui";

/**
 * "Tenho um cupom de desconto".
 *
 * Começa fechado, mas visível: uma faixa com borda e ícone de etiqueta, do
 * mesmo tamanho dos outros controles da coluna. O campo em si só aparece
 * depois do clique — assim quem não tem cupom lê a frase, entende que não é
 * para ela e segue, em vez de encarar um campo vazio pedindo para ser
 * preenchido.
 *
 * Não aparece quando já existe cupom ativo: nesse caso a faixa no topo já
 * mostra qual é, com o botão de remover.
 */
export function AplicarCupom({ jaTemCupom }: { jaTemCupom: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const campo = useRef<HTMLInputElement>(null);

  if (jaTemCupom) return null;

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    iniciar(async () => {
      const resultado = await aplicarCupom(codigo);
      if (resultado.ok) {
        // A árvore inteira volta do servidor com os preços novos e a faixa no
        // topo. Some daqui porque `jaTemCupom` passa a ser verdadeiro.
        setCodigo("");
        return;
      }
      setErro(resultado.erro ?? "Não foi possível aplicar.");
      campo.current?.focus();
    });
  }

  if (!aberto) {
    return (
      <button
        type="button"
        aria-expanded={false}
        onClick={() => {
          setAberto(true);
          // O foco vai para o campo assim que ele existe na tela.
          window.requestAnimationFrame(() => campo.current?.focus());
        }}
        className={estilosBotao({
          variant: "soft",
          size: "xl",
          // Tracejado marca "opcional" sem precisar de outra cor. Nao conflita
          // com a variante: e border-style, nao border-color.
          className: "w-full border-dashed",
        })}
      >
        <IconeEtiqueta className="size-4 text-accent-ink" />
        Tenho um cupom de desconto
      </button>
    );
  }

  return (
    <form
      onSubmit={enviar}
      className="flex flex-col gap-2 border border-dashed border-line-strong bg-surface-alt p-4"
    >
      <label
        htmlFor="cupom-codigo"
        className="flex items-center gap-2 text-xs text-ink"
      >
        <IconeEtiqueta className="size-4 text-accent-ink" />
        Digite o código do cupom
      </label>

      <div className="flex gap-2">
        <input
          ref={campo}
          id="cupom-codigo"
          name="cupom"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Ex.: LENNYS10"
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? "cupom-erro" : undefined}
          className="h-11 min-w-0 flex-1 rounded-none border border-line-strong bg-surface-raised px-3 text-xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={enviando || !codigo.trim()}
          className={estilosBotao({
            variant: "outline",
            size: "lg",
            className: "shrink-0 disabled:opacity-50",
          })}
        >
          {enviando ? "Aplicando" : "Aplicar"}
        </button>
      </div>

      {erro ? (
        <p id="cupom-erro" role="alert" className="text-2xs text-error">
          {erro}
        </p>
      ) : null}
    </form>
  );
}
