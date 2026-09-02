"use client";

import { useState, useTransition } from "react";
import {
  criarEtiqueta,
  excluirEtiqueta,
  moverEtiqueta,
  renomearEtiqueta,
} from "@/app/actions/admin-etiquetas";
import { useToast } from "@/components/admin/toast";
import { Button } from "@/components/ui";
import type { EtiquetaComUso } from "@/lib/queries";
import { cn } from "@/lib/utils";

const LIMITE = 18;

/**
 * O catálogo de etiquetas do painel.
 *
 * Lista em vez de tabela: em 375px uma tabela de quatro colunas vira rolagem
 * lateral, e aqui cada item tem um texto curto e três ações. Empilhado cabe.
 *
 * Renomear é no lugar, sem formulário separado: o campo já é o texto. Um
 * formulário à parte para trocar uma palavra de doze letras seria cerimônia.
 */
export function PainelEtiquetas({
  etiquetas,
}: {
  etiquetas: EtiquetaComUso[];
}) {
  const { avisar } = useToast();
  const [lista, setLista] = useState(etiquetas);
  const [nova, setNova] = useState("");
  const [salvando, iniciar] = useTransition();

  // O que está gravado no banco hoje, por id. Serve para desfazer o campo
  // quando o servidor recusa e para saber se o texto realmente mudou.
  const [salvos, setSalvos] = useState(
    () => new Map(etiquetas.map((e) => [e.id, e.texto])),
  );

  function adicionar(e: React.FormEvent) {
    e.preventDefault();
    const texto = nova.trim();
    if (!texto) return;

    iniciar(async () => {
      const r = await criarEtiqueta(texto);
      if (r.ok && r.id) {
        avisar(`"${texto}" entrou na lista.`);
        setNova("");
        // Com o id que o banco devolveu, e não um inventado aqui: apagar ou
        // renomear a etiqueta recém-criada precisa acertar a linha de verdade.
        setLista((l) => [
          ...l,
          {
            id: r.id as string,
            texto,
            ordem: r.ordem ?? l.length + 1,
            created_at: new Date().toISOString(),
            usos: 0,
          },
        ]);
        setSalvos((m) => new Map(m).set(r.id as string, texto));
      } else {
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function renomear(id: string, texto: string) {
    // O texto salvo vem do estado, não da prop: uma etiqueta criada agora não
    // existe na prop, e desfazer nela devolveria `undefined`.
    const anterior = salvos.get(id) ?? texto;
    const limpo = texto.trim();
    if (!limpo || limpo === anterior) {
      // Voltou ao que era, ou ficou vazio: devolve o texto antigo em vez de
      // gravar. Campo vazio aqui seria uma sugestão em branco na lista.
      setLista((l) =>
        l.map((e) => (e.id === id ? { ...e, texto: anterior } : e)),
      );
      return;
    }

    iniciar(async () => {
      const r = await renomearEtiqueta(id, limpo);
      if (r.ok) {
        setSalvos((m) => new Map(m).set(id, limpo));
        avisar("Etiqueta renomeada.");
      } else {
        setLista((l) =>
          l.map((e) => (e.id === id ? { ...e, texto: anterior } : e)),
        );
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function mover(indice: number, destino: number) {
    if (destino < 0 || destino >= lista.length) return;
    const atual = lista[indice];
    const vizinha = lista[destino];

    const copia = [...lista];
    copia[indice] = vizinha;
    copia[destino] = atual;
    setLista(copia);

    iniciar(async () => {
      const r = await moverEtiqueta(
        atual.id,
        atual.ordem,
        vizinha.id,
        vizinha.ordem,
      );
      if (!r.ok) {
        setLista(etiquetas);
        avisar(r.erro ?? "Não foi possível mudar a ordem.", "erro");
      }
    });
  }

  function excluir(id: string, texto: string, usos: number) {
    iniciar(async () => {
      const r = await excluirEtiqueta(id);
      if (r.ok) {
        setLista((l) => l.filter((e) => e.id !== id));
        avisar(
          usos > 0
            ? `"${texto}" saiu da lista. Os ${usos} vestidos continuam com o selo.`
            : `"${texto}" saiu da lista.`,
        );
      } else {
        avisar(r.erro ?? "Não foi possível apagar.", "erro");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col border border-line bg-surface-raised">
        {lista.map((etiqueta, i) => (
          <li
            key={etiqueta.id}
            className={cn(
              // Duas fileiras no celular, uma só a partir do tablet. Explícito
              // em vez de flex-wrap: com wrap a linha cabia por 2px de folga,
              // e qualquer texto um pouco maior a quebrava em três fileiras.
              "flex flex-col gap-2 border-b border-line p-3 last:border-0",
              "sm:flex-row sm:items-center sm:gap-3",
              salvando && "opacity-60",
            )}
          >
            <div className="flex flex-1 items-center gap-2">
              <div className="flex shrink-0 items-center gap-1">
                <BotaoSeta
                  rotulo={`Subir ${etiqueta.texto}`}
                  simbolo="↑"
                  desabilitado={i === 0}
                  aoClicar={() => mover(i, i - 1)}
                />
                <BotaoSeta
                  rotulo={`Descer ${etiqueta.texto}`}
                  simbolo="↓"
                  desabilitado={i === lista.length - 1}
                  aoClicar={() => mover(i, i + 1)}
                />
              </div>

              <input
                aria-label={`Nome da etiqueta ${etiqueta.texto}`}
                value={etiqueta.texto}
                maxLength={LIMITE}
                onChange={(e) =>
                  setLista((l) =>
                    l.map((x) =>
                      x.id === etiqueta.id
                        ? { ...x, texto: e.target.value }
                        : x,
                    ),
                  )
                }
                onBlur={(e) => renomear(etiqueta.id, e.target.value)}
                className="h-9 min-w-0 flex-1 rounded-none border border-line-strong bg-surface px-3 text-xs text-ink focus:border-ink focus:outline-none"
              />
            </div>

            {/* Contagem e ação ficam juntas na segunda fileira do celular. */}
            <div className="flex shrink-0 items-center justify-end gap-3">
              <span className="text-2xs whitespace-nowrap text-ink-muted">
                {etiqueta.usos === 0
                  ? "nenhum vestido"
                  : etiqueta.usos === 1
                    ? "1 vestido"
                    : `${etiqueta.usos} vestidos`}
              </span>

              <button
                type="button"
                onClick={() =>
                  excluir(etiqueta.id, etiqueta.texto, etiqueta.usos)
                }
                className="text-2xs tracking-caps whitespace-nowrap uppercase text-ink-muted underline underline-offset-4 hover:text-error"
              >
                Tirar da lista
              </button>
            </div>
          </li>
        ))}

        {lista.length === 0 ? (
          <li className="p-5 text-xs text-ink-muted">
            A lista está vazia. Escreva a primeira etiqueta abaixo.
          </li>
        ) : null}
      </ul>

      <form onSubmit={adicionar} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-50 flex-1 flex-col gap-1">
          <label htmlFor="nova-etiqueta" className="text-xs text-ink">
            Nova etiqueta
          </label>
          <input
            id="nova-etiqueta"
            value={nova}
            maxLength={LIMITE}
            onChange={(e) => setNova(e.target.value)}
            placeholder="Novidade, Última peça, Promoção"
            className="h-9 w-full rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink focus:border-ink focus:outline-none"
          />
        </div>
        <Button type="submit" loading={salvando} disabled={!nova.trim()}>
          Adicionar
        </Button>
      </form>

      <p className="max-w-prose text-2xs leading-base text-ink-muted">
        Estas são as sugestões que aparecem na hora de preencher a etiqueta de
        um vestido. Você não fica presa a elas: no cadastro dá para escrever
        qualquer texto. Tirar uma daqui não tira o selo dos vestidos que já
        estão com ela, e renomear aqui também não muda os que já foram salvos.
      </p>
    </div>
  );
}

function BotaoSeta({
  rotulo,
  simbolo,
  desabilitado,
  aoClicar,
}: {
  rotulo: string;
  simbolo: string;
  desabilitado: boolean;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={aoClicar}
      className="size-7 border border-line text-xs text-ink transition-colors duration-200 ease-brand hover:border-ink disabled:opacity-30"
    >
      {simbolo}
    </button>
  );
}
