"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { corEhClara, hexDaCor } from "@/lib/acervo/cores";
import {
  alternar,
  escreverEstado,
  PASSO_PAGINA,
  temFiltroAtivo,
  type EstadoAcervo,
} from "@/lib/acervo/params";
import type { Facetas } from "@/lib/queries";
import { precoBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FaixaPreco } from "./faixa-preco";

export interface PainelFiltrosProps {
  facetas: Facetas;
  estado: EstadoAcervo;
  /** Chamado depois de aplicar um filtro. O drawer usa para se fechar. */
  aoAplicar?: () => void;
  /**
   * Prefixo dos `id` dos controles. A sidebar do desktop e o drawer do mobile
   * renderizam este painel ao mesmo tempo (um fica escondido por CSS, mas
   * ambos existem no DOM), entao sem prefixo os `id` colidiriam e todo
   * `label` apontaria para o primeiro input.
   */
  idPrefixo: string;
}

/**
 * Controles de filtro do acervo.
 *
 * Nenhum filtro guarda estado próprio: tudo é lido da URL e escrito de volta
 * nela. Recarregar a página, voltar no histórico ou colar o link no WhatsApp
 * reproduzem a mesma seleção.
 *
 * Toda mudança zera a paginação, senão a cliente filtraria e continuaria
 * vendo 36 peças de um resultado que agora tem 4.
 */
export function PainelFiltros({
  facetas,
  estado,
  aoAplicar,
  idPrefixo,
}: PainelFiltrosProps) {
  const router = useRouter();

  const aplicar = useCallback(
    (mudanca: Partial<EstadoAcervo>) => {
      const novo: EstadoAcervo = {
        ...estado,
        ...mudanca,
        mostrar: PASSO_PAGINA,
      };
      router.push(escreverEstado(novo), { scroll: false });
      aoAplicar?.();
    },
    [estado, router, aoAplicar],
  );

  const limpar = () => {
    router.push("/acervo", { scroll: false });
    aoAplicar?.();
  };

  return (
    <div className="flex flex-col gap-8">
      {temFiltroAtivo(estado) ? (
        <button
          type="button"
          onClick={limpar}
          className="self-start text-2xs tracking-caps uppercase text-accent-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-ink"
        >
          Limpar filtros
        </button>
      ) : null}

      <Grupo titulo="Categoria">
        <ul className="flex flex-col gap-2">
          {facetas.categorias.map((opcao) => {
            const id = `${idPrefixo}-cat-${opcao.valor}`;
            const marcado = estado.categorias.includes(opcao.valor);
            return (
              <li key={opcao.valor} className="flex items-center gap-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={marcado}
                  onChange={() =>
                    aplicar({ categorias: alternar(estado.categorias, opcao.valor) })
                  }
                  className={cn(
                    "size-3 shrink-0 cursor-pointer appearance-none rounded-none",
                    "border border-line-strong bg-surface-raised",
                    "transition-colors duration-200 ease-brand",
                    "checked:border-accent checked:bg-accent hover:border-accent",
                  )}
                />
                <label
                  htmlFor={id}
                  className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-xs text-ink"
                >
                  <span>{opcao.rotulo}</span>
                  <span className="text-2xs text-ink-muted">{opcao.total}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Grupo>

      <Grupo titulo="Cor">
        <ul className="flex flex-wrap gap-2">
          {facetas.cores.map((opcao) => {
            const selecionada = estado.cores.includes(opcao.valor);
            return (
              <li key={opcao.valor}>
                <button
                  type="button"
                  onClick={() =>
                    aplicar({ cores: alternar(estado.cores, opcao.valor) })
                  }
                  aria-pressed={selecionada}
                  title={`${opcao.rotulo} (${opcao.total})`}
                  className={cn(
                    "size-9 rounded-full border transition-colors duration-200 ease-brand",
                    selecionada
                      ? "border-accent ring-1 ring-accent"
                      : corEhClara(opcao.valor)
                        ? "border-line-strong hover:border-accent"
                        : "border-transparent hover:border-accent",
                  )}
                  style={{ backgroundColor: hexDaCor(opcao.valor) }}
                >
                  <span className="sr-only">
                    {opcao.rotulo}, {opcao.total} peças
                    {selecionada ? ", selecionada" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Grupo>

      {facetas.tamanhos.length ? (
        <Grupo titulo="Tamanho">
          <ul className="flex flex-wrap gap-2">
            {facetas.tamanhos.map((opcao) => {
              const marcado = estado.tamanhos.includes(opcao.valor);
              return (
                <li key={opcao.valor}>
                  <button
                    type="button"
                    onClick={() =>
                      aplicar({ tamanhos: alternar(estado.tamanhos, opcao.valor) })
                    }
                    aria-pressed={marcado}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-none border text-xs",
                      "transition-colors duration-200 ease-brand",
                      marcado
                        ? "border-ink bg-ink text-ink-inverse"
                        : "border-line-strong text-ink hover:border-accent hover:text-accent-ink",
                    )}
                  >
                    {opcao.rotulo}
                    <span className="sr-only">, {opcao.total} peças</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Grupo>
      ) : null}

      <Grupo titulo="Preço">
        <FaixaPreco
          min={facetas.precoMin}
          max={facetas.precoMax}
          valorMin={estado.precoMin ?? facetas.precoMin}
          valorMax={estado.precoMax ?? facetas.precoMax}
          aoMudar={(min, max) =>
            aplicar({
              precoMin: min === facetas.precoMin ? undefined : min,
              precoMax: max === facetas.precoMax ? undefined : max,
            })
          }
          formatar={precoBRL}
        />
      </Grupo>
    </div>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-bold tracking-default text-ink">{titulo}</h3>
      {children}
    </section>
  );
}
