"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  atualizarCupom,
  criarCupom,
  type DadosCupom,
} from "@/app/actions/admin-cupons";
import { EntregaCupom } from "@/components/admin/entrega-cupom";
import { useToast } from "@/components/admin/toast";
import { Button, Input, estilosBotao } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface FormularioCupomProps {
  site: string;
  cupomId?: string;
  valoresIniciais: DadosCupom;
}

export function FormularioCupom({
  site,
  cupomId,
  valoresIniciais,
}: FormularioCupomProps) {
  const router = useRouter();
  const { avisar } = useToast();
  const [dados, setDados] = useState<DadosCupom>(valoresIniciais);
  const [salvando, iniciar] = useTransition();
  const [salvou, setSalvou] = useState(Boolean(cupomId));

  function campo<K extends keyof DadosCupom>(chave: K, valor: DadosCupom[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = cupomId
        ? await atualizarCupom(cupomId, dados)
        : await criarCupom(dados);

      if (!r.ok) {
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
        return;
      }

      avisar(cupomId ? "Cupom salvo." : `Cupom ${dados.codigo} criado.`);
      setSalvou(true);
      if (!cupomId && r.id) router.push(`/admin/cupons/${r.id}`);
      else router.refresh();
    });
  }

  return (
    <div className="flex max-w-200 flex-col gap-8">
      <form onSubmit={salvar} className="flex flex-col gap-6">
        <Input
          id="codigo"
          label="Código do cupom"
          hint="É o que a cliente vê no link. Só letras e números — vira maiúscula sozinho."
          value={dados.codigo}
          onChange={(e) => campo("codigo", e.target.value.toUpperCase())}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nome"
            label="Nome da influenciadora"
            hint="Aparece no aviso que a cliente vê no site."
            value={dados.influenciadoraNome}
            onChange={(e) => campo("influenciadoraNome", e.target.value)}
          />
          <Input
            id="instagram"
            label="@ do Instagram"
            hint="Só para seu controle. Não aparece no site."
            value={dados.influenciadoraInstagram}
            onChange={(e) => campo("influenciadoraInstagram", e.target.value)}
          />
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs text-ink">Tipo de desconto</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["percentual", "Porcentagem"],
                ["fixo", "Valor em reais"],
              ] as const
            ).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={dados.tipoDesconto === valor}
                onClick={() => campo("tipoDesconto", valor)}
                className={estilosBotao({
                  variant: dados.tipoDesconto === valor ? "primary" : "outline",
                  size: "md",
                })}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </fieldset>

        <Input
          id="valor"
          type="number"
          min={0}
          step="0.01"
          label={
            dados.tipoDesconto === "percentual"
              ? "Desconto, em porcentagem"
              : "Desconto, em reais"
          }
          hint={
            dados.tipoDesconto === "percentual"
              ? "Ex.: 10 significa 10% de desconto."
              : "Ex.: 50 significa R$ 50,00 a menos."
          }
          value={String(dados.valor)}
          onChange={(e) => campo("valor", Number(e.target.value))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="inicio"
            type="date"
            label="Começa em"
            hint="Deixe em branco para valer desde já. Com data, o desconto liga sozinho no dia."
            value={dados.inicio ?? ""}
            onChange={(e) => campo("inicio", e.target.value || null)}
          />
          <Input
            id="validade"
            type="date"
            label="Vale até"
            hint="Pode deixar em branco: sem data, o cupom não expira."
            value={dados.validade ?? ""}
            onChange={(e) => campo("validade", e.target.value || null)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="limite"
            type="number"
            min={1}
            label="Limite de usos"
            hint="Pode deixar em branco: sem limite."
            value={dados.limiteUsos === null ? "" : String(dados.limiteUsos)}
            onChange={(e) =>
              campo("limiteUsos", e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>

        <div className="flex items-start gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={dados.ativo}
            onClick={() => campo("ativo", !dados.ativo)}
            className={cn(
              "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ease-brand",
              dados.ativo
                ? "border-accent bg-accent"
                : "border-line-strong bg-surface-alt",
            )}
          >
            <span className="sr-only">Cupom valendo</span>
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-0.5 size-3.5 rounded-full bg-surface-raised transition-all duration-200 ease-brand",
                dados.ativo ? "left-4.5" : "left-0.5",
              )}
            />
          </button>
          <div className="flex flex-col">
            <span className="text-xs text-ink">Cupom valendo</span>
            <span className="text-2xs text-ink-muted">
              Desligado, o link continua abrindo o site mas não dá desconto.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" loading={salvando}>
            {cupomId ? "Salvar alterações" : "Criar cupom"}
          </Button>
          <Link
            href="/admin/cupons"
            className="text-xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
          >
            Voltar sem salvar
          </Link>
        </div>
      </form>

      {salvou && dados.codigo ? (
        <EntregaCupom
          site={site}
          cupom={{
            codigo: dados.codigo.toUpperCase(),
            influenciadora_nome: dados.influenciadoraNome,
            tipo_desconto: dados.tipoDesconto,
            valor: dados.valor,
            ativo: dados.ativo,
            inicio: dados.inicio,
            validade: dados.validade,
            limite_usos: dados.limiteUsos,
            usos: 0,
          }}
        />
      ) : null}
    </div>
  );
}
