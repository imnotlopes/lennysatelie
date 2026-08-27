"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  alternarCupomAtivo,
  atualizarUsos,
} from "@/app/actions/admin-cupons";
import { useToast } from "@/components/admin/toast";
import { descontoLegivel, situacaoCupom, type EstadoCupom } from "@/lib/cupom";
import type { CupomComMetrica } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";

type Ordem = "cliques" | "visitas" | "codigo";

export function TabelaCupons({ cupons }: { cupons: CupomComMetrica[] }) {
  const { avisar } = useToast();
  const [ordem, setOrdem] = useState<Ordem>("cliques");

  const ordenados = [...cupons].sort((a, b) => {
    if (ordem === "codigo") return a.codigo.localeCompare(b.codigo);
    return b[ordem] - a[ordem];
  });

  return (
    <div className="overflow-x-auto border border-line bg-surface-raised">
      <table className="w-full min-w-200 text-left">
        <thead>
          <tr className="border-b border-line">
            <Coluna rotulo="Código" ordenar={() => setOrdem("codigo")} ativa={ordem === "codigo"} />
            <Coluna rotulo="Influenciadora" />
            <Coluna rotulo="Instagram" />
            <Coluna rotulo="Desconto" />
            <Coluna rotulo="Visitas" ordenar={() => setOrdem("visitas")} ativa={ordem === "visitas"} />
            <Coluna rotulo="Cliques" ordenar={() => setOrdem("cliques")} ativa={ordem === "cliques"} />
            <Coluna rotulo="Alugados" />
            <Coluna rotulo="Situação" />
            <Coluna rotulo="Ligado" />
            <Coluna rotulo="" />
          </tr>
        </thead>
        <tbody>
          {ordenados.map((cupom) => (
            <Linha key={cupom.id} cupom={cupom} aoAvisar={avisar} />
          ))}
        </tbody>
      </table>

      {cupons.length === 0 ? (
        <p className="p-6 text-xs text-ink-muted">
          Nenhum cupom criado ainda. O primeiro leva menos de um minuto.
        </p>
      ) : null}
    </div>
  );
}

function Coluna({
  rotulo,
  ordenar,
  ativa,
}: {
  rotulo: string;
  ordenar?: () => void;
  ativa?: boolean;
}) {
  return (
    <th
      scope="col"
      className="p-3 text-2xs tracking-caps uppercase text-ink-muted"
      aria-sort={ativa ? "descending" : undefined}
    >
      {ordenar ? (
        <button
          type="button"
          onClick={ordenar}
          className={cn(
            "underline underline-offset-4 transition-colors hover:text-accent-ink",
            ativa && "text-ink",
          )}
        >
          {rotulo}
        </button>
      ) : (
        rotulo
      )}
    </th>
  );
}

function Linha({
  cupom,
  aoAvisar,
}: {
  cupom: CupomComMetrica;
  aoAvisar: (texto: string, tom?: "sucesso" | "erro") => void;
}) {
  const [ativo, setAtivo] = useState(cupom.ativo);
  const [usos, setUsos] = useState(String(cupom.usos));
  const [salvando, iniciar] = useTransition();

  function salvarUsos() {
    const n = Number.parseInt(usos, 10);
    if (!Number.isFinite(n) || n === cupom.usos) return;

    iniciar(async () => {
      const r = await atualizarUsos(cupom.id, n);
      if (r.ok) aoAvisar(`${cupom.codigo}: ${n} aluguéis confirmados.`);
      else {
        setUsos(String(cupom.usos));
        aoAvisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  return (
    <tr className={cn("border-b border-line last:border-0", salvando && "opacity-60")}>
      <td className="p-3 text-xs font-bold text-ink">{cupom.codigo}</td>
      <td className="p-3 text-xs text-ink">{cupom.influenciadora_nome ?? "—"}</td>
      <td className="p-3 text-xs text-ink-muted">
        {cupom.influenciadora_instagram ?? "—"}
      </td>
      <td className="p-3 text-xs text-ink">
        {descontoLegivel(cupom)}
      </td>
      <td className="p-3 text-xs text-ink">{cupom.visitas}</td>
      <td className="p-3 text-xs text-ink">{cupom.cliques}</td>
      <td className="p-3">
        <input
          type="number"
          min={0}
          value={usos}
          onChange={(e) => setUsos(e.target.value)}
          onBlur={salvarUsos}
          aria-label={`Aluguéis confirmados com o cupom ${cupom.codigo}`}
          className="h-8 w-16 border border-line-strong bg-surface-raised px-2 text-xs text-ink focus:border-ink focus:outline-none"
        />
      </td>
      <td className="p-3">
        <Situacao cupom={{ ...cupom, ativo }} />
      </td>
      <td className="p-3">
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          onClick={() => {
            const novo = !ativo;
            setAtivo(novo);
            iniciar(async () => {
              const r = await alternarCupomAtivo(cupom.id, novo);
              if (!r.ok) {
                setAtivo(!novo);
                aoAvisar(r.erro ?? "Não foi possível salvar.", "erro");
              }
            });
          }}
          className={cn(
            "relative h-5 w-9 rounded-full border transition-colors duration-200 ease-brand",
            ativo ? "border-accent bg-accent" : "border-line-strong bg-surface-alt",
          )}
        >
          <span className="sr-only">Cupom {cupom.codigo} ligado</span>
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-0.5 size-3.5 rounded-full bg-surface-raised transition-all duration-200 ease-brand",
              ativo ? "left-4.5" : "left-0.5",
            )}
          />
        </button>
      </td>
      <td className="p-3">
        <Link
          href={`/admin/cupons/${cupom.id}`}
          className="text-2xs tracking-caps uppercase text-ink underline underline-offset-4 hover:text-accent-ink"
        >
          Abrir
        </Link>
      </td>
    </tr>
  );
}

/**
 * Situação real do cupom, em uma palavra.
 *
 * Existe porque o interruptor sozinho engana: ele diz "ligado", não "está
 * funcionando". Um cupom ligado e vencido aparecia idêntico a um ligado e
 * valendo, e a influenciadora podia passar meses divulgando um link morto.
 *
 * Cor só onde ela informa. Vencido e esgotado em vermelho porque exigem ação;
 * agendado em texto discreto porque é o esperado, não um problema.
 */
function Situacao({ cupom }: { cupom: Parameters<typeof situacaoCupom>[0] }) {
  const { estado, rotulo, detalhe } = situacaoCupom(cupom);

  const cor: Record<EstadoCupom, string> = {
    valendo: "text-success",
    agendado: "text-ink",
    vencido: "text-error",
    esgotado: "text-error",
    desligado: "text-ink-muted",
  };

  return (
    <span className="flex flex-col">
      <span className={cn("text-xs", cor[estado])}>{rotulo}</span>
      {detalhe ? (
        <span className="text-2xs text-ink-muted">{detalhe}</span>
      ) : null}
    </span>
  );
}
