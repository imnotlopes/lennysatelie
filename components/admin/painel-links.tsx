"use client";

import { useState, useTransition } from "react";
import {
  alternarLink,
  destacarLink,
  moverLink,
  salvarLink,
} from "@/app/actions/admin-links";
import { useToast } from "@/components/admin/toast";
import type { LinkComCliques } from "@/lib/queries";
import type { IconeLink } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const LIMITE_TITULO = 28;
const LIMITE_SUBTITULO = 34;

/**
 * Os ícones, com nome que a dona do ateliê entenda.
 *
 * A lista é fechada porque cada nome corresponde a um desenho em SVG no
 * código. Campo livre aqui deixaria o botão sem ícone, e sem explicação de
 * por quê.
 */
const ICONES: { valor: IconeLink; rotulo: string }[] = [
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "instagram", rotulo: "Instagram" },
  { valor: "facebook", rotulo: "Facebook" },
  { valor: "site", rotulo: "Site (globo)" },
  { valor: "acervo", rotulo: "Acervo (cabide)" },
  { valor: "email", rotulo: "E-mail (envelope)" },
];

/**
 * Os botões da página de links.
 *
 * Lista empilhada e não tabela: cada botão tem quatro campos e quatro ações, e
 * em 375px uma tabela disso vira rolagem lateral. É a mesma escolha do painel
 * de etiquetas.
 *
 * Salvar acontece ao sair do campo, sem botão de salvar: o formulário já é o
 * conteúdo. Um botão separado para trocar uma palavra seria cerimônia, e é o
 * padrão que ela já conhece das etiquetas.
 */
export function PainelLinks({ links }: { links: LinkComCliques[] }) {
  const { avisar } = useToast();
  const [lista, setLista] = useState(links);
  const [salvando, iniciar] = useTransition();

  /** O que está gravado hoje. Serve para desfazer quando o servidor recusa. */
  const [salvos, setSalvos] = useState(
    () => new Map(links.map((l) => [l.id, l])),
  );

  function editar(id: string, campo: "titulo" | "subtitulo" | "url", valor: string) {
    setLista((l) => l.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));
  }

  function gravar(id: string) {
    const link = lista.find((l) => l.id === id);
    const anterior = salvos.get(id);
    if (!link || !anterior) return;

    const mudou =
      link.titulo !== anterior.titulo ||
      (link.subtitulo ?? "") !== (anterior.subtitulo ?? "") ||
      link.icone !== anterior.icone ||
      link.url !== anterior.url;

    if (!mudou) return;

    iniciar(async () => {
      const r = await salvarLink(id, {
        titulo: link.titulo,
        subtitulo: link.subtitulo ?? "",
        icone: link.icone,
        url: link.url,
      });

      if (r.ok) {
        setSalvos((m) => new Map(m).set(id, link));
        avisar("Botão salvo.");
      } else {
        setLista((l) => l.map((x) => (x.id === id ? anterior : x)));
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function alternar(id: string, ativo: boolean) {
    setLista((l) => l.map((x) => (x.id === id ? { ...x, ativo } : x)));
    iniciar(async () => {
      const r = await alternarLink(id, ativo);
      if (r.ok) {
        avisar(ativo ? "Botão de volta na página." : "Botão fora da página.");
      } else {
        setLista((l) =>
          l.map((x) => (x.id === id ? { ...x, ativo: !ativo } : x)),
        );
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function destacar(id: string) {
    setLista((l) => l.map((x) => ({ ...x, destaque: x.id === id })));
    iniciar(async () => {
      const r = await destacarLink(id);
      if (r.ok) {
        avisar("Esse virou o botão principal.");
      } else {
        setLista(links);
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function mover(indice: number, destino: number) {
    if (destino < 0 || destino >= lista.length) return;
    const atual = lista[indice];
    const vizinho = lista[destino];

    const copia = [...lista];
    copia[indice] = vizinho;
    copia[destino] = atual;
    setLista(copia);

    iniciar(async () => {
      const r = await moverLink(
        atual.id,
        atual.ordem,
        vizinho.id,
        vizinho.ordem,
      );
      if (!r.ok) {
        setLista(links);
        avisar(r.erro ?? "Não foi possível mudar a ordem.", "erro");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {lista.map((link, i) => (
          <li
            key={link.id}
            className={cn(
              "flex flex-col gap-3 border border-line bg-surface-raised p-4",
              // Desligado fica apagado na lista: ela precisa ver de relance o
              // que está no ar e o que não está.
              (salvando || !link.ativo) && "opacity-60",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex shrink-0 items-center gap-1">
                <BotaoSeta
                  rotulo={`Subir ${link.titulo}`}
                  simbolo="↑"
                  desabilitado={i === 0}
                  aoClicar={() => mover(i, i - 1)}
                />
                <BotaoSeta
                  rotulo={`Descer ${link.titulo}`}
                  simbolo="↓"
                  desabilitado={i === lista.length - 1}
                  aoClicar={() => mover(i, i + 1)}
                />
              </div>

              <input
                aria-label={`Nome do botão ${link.titulo}`}
                value={link.titulo}
                maxLength={LIMITE_TITULO}
                onChange={(e) => editar(link.id, "titulo", e.target.value)}
                onBlur={() => gravar(link.id)}
                className="h-9 min-w-0 flex-1 rounded-none border border-line-strong bg-surface px-3 text-xs text-ink focus:border-ink focus:outline-none"
              />

              <span className="shrink-0 text-2xs whitespace-nowrap text-ink-muted">
                {link.cliques === 0
                  ? "nenhum clique"
                  : link.cliques === 1
                    ? "1 clique"
                    : `${link.cliques} cliques`}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                aria-label={`Frase de baixo do botão ${link.titulo}`}
                value={link.subtitulo ?? ""}
                maxLength={LIMITE_SUBTITULO}
                placeholder="Frase de baixo (opcional)"
                onChange={(e) => editar(link.id, "subtitulo", e.target.value)}
                onBlur={() => gravar(link.id)}
                className="h-9 min-w-0 flex-1 rounded-none border border-line-strong bg-surface px-3 text-xs text-ink focus:border-ink focus:outline-none"
              />

              <select
                aria-label={`Ícone do botão ${link.titulo}`}
                value={link.icone}
                onChange={(e) => {
                  const icone = e.target.value as IconeLink;
                  setLista((l) =>
                    l.map((x) => (x.id === link.id ? { ...x, icone } : x)),
                  );
                }}
                onBlur={() => gravar(link.id)}
                className="h-9 shrink-0 rounded-none border border-line-strong bg-surface px-2 text-xs text-ink focus:border-ink focus:outline-none"
              >
                {ICONES.map((icone) => (
                  <option key={icone.valor} value={icone.valor}>
                    {icone.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <input
              aria-label={`Endereço do botão ${link.titulo}`}
              value={link.url}
              inputMode="url"
              onChange={(e) => editar(link.id, "url", e.target.value)}
              onBlur={() => gravar(link.id)}
              className="h-9 w-full rounded-none border border-line-strong bg-surface px-3 text-xs text-ink focus:border-ink focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-2xs text-ink">
                <input
                  type="checkbox"
                  checked={link.ativo}
                  onChange={(e) => alternar(link.id, e.target.checked)}
                  className="size-4 accent-ink"
                />
                Aparece na página
              </label>

              <label className="flex items-center gap-2 text-2xs text-ink">
                <input
                  type="radio"
                  name="destaque"
                  checked={link.destaque}
                  onChange={() => destacar(link.id)}
                  className="size-4 accent-ink"
                />
                Botão principal (o preto)
              </label>
            </div>
          </li>
        ))}
      </ul>

      <p className="max-w-prose text-2xs leading-base text-ink-muted">
        Estes são os botões da sua página de links, o endereço que vai no link
        da bio do Instagram. A contagem é dos últimos 30 dias e inclui os
        atalhos do rodapé. Só um botão pode ser o principal: ao marcar um, o
        anterior deixa de ser.
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
