"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  alternarCampo,
  excluirProduto,
  salvarEtiquetaDoProduto,
} from "@/app/actions/admin-produtos";
import { useToast } from "@/components/admin/toast";
import { estilosBotao } from "@/components/ui";
import { precoBRL } from "@/lib/format";
import { imagemProduto } from "@/lib/images";
import type { Categoria, ProdutoComCategoria } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface TabelaProdutosProps {
  produtos: ProdutoComCategoria[];
  categorias: Categoria[];
  /** Sugestões do catálogo, para etiquetar sem digitar tudo de novo. */
  etiquetas: string[];
}

export function TabelaProdutos({
  produtos,
  categorias,
  etiquetas,
}: TabelaProdutosProps) {
  const { avisar } = useToast();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [paraExcluir, setParaExcluir] = useState<ProdutoComCategoria | null>(
    null,
  );

  // Filtro no cliente: são algumas centenas de peças, e filtrar sem ida ao
  // servidor deixa a busca instantânea enquanto a dona digita.
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      if (termo && !p.nome.toLowerCase().includes(termo)) return false;
      if (categoria && p.categoria?.slug !== categoria) return false;
      return true;
    });
  }, [produtos, busca, categoria]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-1">
          <label htmlFor="busca" className="text-2xs text-ink-muted">
            Buscar pelo nome
          </label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite parte do nome"
            className="h-9 rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink focus:border-ink focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cat" className="text-2xs text-ink-muted">
            Categoria
          </label>
          <select
            id="cat"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-9 cursor-pointer rounded-none border border-line-strong bg-surface-raised px-2 text-xs text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <p className="ml-auto text-2xs text-ink-muted" aria-live="polite">
          {visiveis.length} de {produtos.length}
        </p>
      </div>

      {/* Um datalist só para a tabela inteira. Um por linha seriam duzentas
          cópias da mesma lista no HTML. */}
      <datalist id="etiquetas-da-lista">
        {etiquetas.map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>

      <div className="overflow-x-auto border border-line bg-surface-raised">
        <table className="w-full min-w-180 text-left">
          <thead>
            <tr className="border-b border-line">
              {[
                "Foto",
                "Vestido",
                "Categoria",
                "Etiqueta",
                "Preço",
                "No site",
                "Destaque",
                "",
              ].map(
                (t) => (
                  <th
                    key={t}
                    scope="col"
                    className="p-3 text-2xs tracking-caps uppercase text-ink-muted"
                  >
                    {t}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visiveis.map((produto) => (
              <Linha
                key={produto.id}
                produto={produto}
                aoExcluir={() => setParaExcluir(produto)}
                aoAvisar={avisar}
              />
            ))}
          </tbody>
        </table>

        {visiveis.length === 0 ? (
          <p className="p-6 text-xs text-ink-muted">
            Nenhum vestido com esse nome nessa categoria.
          </p>
        ) : null}
      </div>

      {paraExcluir ? (
        <ModalExclusao
          produto={paraExcluir}
          aoFechar={() => setParaExcluir(null)}
          aoAvisar={avisar}
        />
      ) : null}
    </div>
  );
}

function Linha({
  produto,
  aoExcluir,
  aoAvisar,
}: {
  produto: ProdutoComCategoria;
  aoExcluir: () => void;
  aoAvisar: (texto: string, tom?: "sucesso" | "erro") => void;
}) {
  const [ativo, setAtivo] = useState(produto.ativo);
  const [destaque, setDestaque] = useState(produto.destaque);
  const [etiqueta, setEtiqueta] = useState(produto.etiqueta ?? "");
  const [salvando, iniciar] = useTransition();

  /**
   * Grava a etiqueta ao sair do campo.
   *
   * Sem botão de salvar: uma coluna com um botão por linha em duzentas linhas
   * seria uma parede de botões. Sair do campo é o gesto que a dona já faz para
   * ir à próxima peça.
   */
  function gravarEtiqueta(valor: string) {
    const limpo = valor.trim();
    if (limpo === (produto.etiqueta ?? "")) return;

    iniciar(async () => {
      const r = await salvarEtiquetaDoProduto(produto.id, limpo);
      if (r.ok) {
        aoAvisar(
          limpo
            ? `${produto.nome}: etiqueta "${limpo}".`
            : `${produto.nome} ficou sem etiqueta.`,
        );
      } else {
        setEtiqueta(produto.etiqueta ?? "");
        aoAvisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function alternar(campo: "ativo" | "destaque", valor: boolean) {
    // Muda na tela na hora e desfaz se o servidor recusar: esperar a ida e
    // volta a cada clique deixaria a tabela lenta de usar.
    if (campo === "ativo") setAtivo(valor);
    else setDestaque(valor);

    iniciar(async () => {
      const r = await alternarCampo(produto.id, campo, valor);
      if (!r.ok) {
        if (campo === "ativo") setAtivo(!valor);
        else setDestaque(!valor);
        aoAvisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  return (
    <tr className={cn("border-b border-line last:border-0", salvando && "opacity-60")}>
      <td className="p-3">
        <div className="relative aspect-product w-10 overflow-hidden bg-surface-alt">
          <Image
            src={imagemProduto(produto.imagens)}
            alt=""
            fill
            sizes="60px"
            className="object-cover"
          />
        </div>
      </td>
      <td className="p-3 text-xs text-ink">{produto.nome}</td>
      <td className="p-3 text-xs text-ink-muted">
        {produto.categoria?.nome ?? "—"}
      </td>
      <td className="p-3">
        <input
          aria-label={`Etiqueta de ${produto.nome}`}
          list="etiquetas-da-lista"
          value={etiqueta}
          maxLength={18}
          placeholder="sem etiqueta"
          onChange={(e) => setEtiqueta(e.target.value)}
          onBlur={(e) => gravarEtiqueta(e.target.value)}
          className="h-8 w-28 rounded-none border border-line bg-surface px-2 text-2xs text-ink focus:border-ink focus:outline-none"
        />
      </td>
      <td className="p-3 text-xs text-ink">
        {produto.preco_locacao === null
          ? "Sob consulta"
          : precoBRL(produto.preco_locacao)}
      </td>
      <td className="p-3">
        <Interruptor
          rotulo={`Mostrar ${produto.nome} no site`}
          ligado={ativo}
          aoMudar={(v) => alternar("ativo", v)}
        />
      </td>
      <td className="p-3">
        <Interruptor
          rotulo={`Destacar ${produto.nome} na home`}
          ligado={destaque}
          aoMudar={(v) => alternar("destaque", v)}
        />
      </td>
      <td className="p-3">
        <div className="flex gap-3 whitespace-nowrap">
          <Link
            href={`/admin/produtos/${produto.id}`}
            className="text-2xs tracking-caps uppercase text-ink underline underline-offset-4 hover:text-accent-ink"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={aoExcluir}
            className="text-2xs tracking-caps uppercase text-ink-muted underline underline-offset-4 hover:text-error"
          >
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

function Interruptor({
  rotulo,
  ligado,
  aoMudar,
}: {
  rotulo: string;
  ligado: boolean;
  aoMudar: (valor: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => aoMudar(!ligado)}
      className={cn(
        "relative h-5 w-9 rounded-full border transition-colors duration-200 ease-brand",
        ligado ? "border-accent bg-accent" : "border-line-strong bg-surface-alt",
      )}
    >
      <span className="sr-only">{rotulo}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 size-3.5 rounded-full bg-surface-raised transition-all duration-200 ease-brand",
          ligado ? "left-4.5" : "left-0.5",
        )}
      />
    </button>
  );
}

function ModalExclusao({
  produto,
  aoFechar,
  aoAvisar,
}: {
  produto: ProdutoComCategoria;
  aoFechar: () => void;
  aoAvisar: (texto: string, tom?: "sucesso" | "erro") => void;
}) {
  const [excluindo, iniciar] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancelar"
        onClick={aoFechar}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-exclusao"
        className="relative flex w-full max-w-96 flex-col gap-3 border border-line bg-surface-raised p-6"
      >
        <h2 id="titulo-exclusao" className="font-display text-lg leading-tight text-ink">
          Excluir {produto.nome}?
        </h2>
        <p className="text-xs leading-base text-ink-muted">
          O vestido sai do site e as fotos dele são apagadas. Não dá para
          desfazer. Se você só quer tirar do ar por um tempo, feche esta janela
          e desligue a chave &quot;No site&quot;.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={excluindo}
            onClick={() =>
              iniciar(async () => {
                const r = await excluirProduto(produto.id);
                if (r.ok) {
                  aoAvisar(`${produto.nome} foi excluído.`);
                  aoFechar();
                } else {
                  aoAvisar(r.erro ?? "Não foi possível excluir.", "erro");
                }
              })
            }
            className={estilosBotao({
              variant: "danger",
              className: "disabled:opacity-50",
            })}
          >
            {excluindo ? "Excluindo" : "Excluir"}
          </button>
          <button
            type="button"
            onClick={aoFechar}
            className={estilosBotao({ variant: "outline" })}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
