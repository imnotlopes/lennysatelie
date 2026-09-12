"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { sair } from "@/app/admin/actions";
import {
  IconeColecoes,
  IconeConfiguracoes,
  IconeCupons,
  IconeEtiquetas,
  IconeLinks,
  IconeImagens,
  IconeInicio,
  IconeMais,
  IconeSair,
  IconeVestidos,
  type Icone,
} from "@/components/admin/icones";
import { cn } from "@/lib/utils";

interface Destino {
  href: string;
  rotulo: string;
  icone: Icone;
}

/**
 * As cinco da barra do celular, na ordem de quem usa o painel toda semana.
 *
 * Vestidos, Coleções e Cupons são o trabalho do dia a dia. O resto está atrás
 * de "Mais": sete abas numa tela de 375px dariam 53px cada, e "Configurações"
 * viraria "Config." — apertado justamente na largura que o projeto promete
 * que funciona.
 */
const PRINCIPAIS: Destino[] = [
  { href: "/admin", rotulo: "Início", icone: IconeInicio },
  { href: "/admin/produtos", rotulo: "Vestidos", icone: IconeVestidos },
  { href: "/admin/categorias", rotulo: "Coleções", icone: IconeColecoes },
  { href: "/admin/cupons", rotulo: "Cupons", icone: IconeCupons },
];

/** O que ela abre de vez em quando. Fica atrás do "Mais" no celular. */
const SECUNDARIOS: Destino[] = [
  { href: "/admin/imagens", rotulo: "Imagens do site", icone: IconeImagens },
  { href: "/admin/links", rotulo: "Página de links", icone: IconeLinks },
  { href: "/admin/etiquetas", rotulo: "Etiquetas", icone: IconeEtiquetas },
  {
    href: "/admin/configuracoes",
    rotulo: "Configurações",
    icone: IconeConfiguracoes,
  },
];

const TODOS = [...PRINCIPAIS, ...SECUNDARIOS];

function estaAtivo(href: string, pathname: string): boolean {
  // "/admin" casaria com tudo se usasse startsWith.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export interface NavegacaoProps {
  /** E-mail da conta. Aparece no rodapé no desktop e dentro do "Mais". */
  usuario: string;
}

/**
 * Navegação do painel.
 *
 * No celular é uma barra fixa no rodapé, ícone em cima do rótulo, no formato
 * que o Edson trouxe de referência. No desktop vira a coluna da esquerda, com
 * os mesmos ícones e a mesma ordem — muda o arranjo, não o vocabulário.
 *
 * Fixa embaixo e não em cima porque é onde o polegar alcança, e porque a barra
 * de cima já é do navegador.
 */
export function Navegacao({ usuario }: NavegacaoProps) {
  const pathname = usePathname();
  const [saindo, iniciar] = useTransition();
  const [mostrandoMais, setMostrandoMais] = useState(false);

  useEffect(() => {
    if (!mostrandoMais) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMostrandoMais(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [mostrandoMais]);

  const emSecundario = SECUNDARIOS.some((d) => estaAtivo(d.href, pathname));

  function encerrarSessao() {
    iniciar(() => void sair());
  }

  return (
    <>
      {/* ---- Desktop: coluna da esquerda ---- */}
      <nav
        aria-label="Navegação do painel"
        className="hidden shrink-0 flex-col border-r border-line bg-surface-alt px-3 py-4 lg:flex lg:w-56"
      >
        <span className="px-2 pb-4 font-display text-lg leading-none text-ink">
          Lennys Ateliê
        </span>

        <ul className="flex flex-1 flex-col gap-1">
          {TODOS.map((destino) => {
            const ativo = estaAtivo(destino.href, pathname);
            const Icone = destino.icone;

            return (
              <li key={destino.href}>
                <Link
                  href={destino.href}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs tracking-default",
                    "transition-colors duration-200 ease-brand",
                    ativo
                      ? "bg-surface-raised text-accent-ink"
                      : "text-ink hover:text-accent-ink",
                  )}
                >
                  <Icone className="size-4.5 shrink-0" />
                  {destino.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-1 border-t border-line pt-3">
          <span className="truncate px-3 text-2xs text-ink-muted" title={usuario}>
            {usuario}
          </span>
          <button
            type="button"
            disabled={saindo}
            onClick={encerrarSessao}
            className="flex items-center gap-3 px-3 py-2 text-left text-2xs tracking-caps uppercase text-ink-muted transition-colors duration-200 ease-brand hover:text-accent-ink disabled:opacity-50"
          >
            <IconeSair className="size-4.5 shrink-0" />
            {saindo ? "Saindo" : "Sair"}
          </button>
        </div>
      </nav>

      {/* ---- Celular: folha do "Mais" ---- */}
      {mostrandoMais ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setMostrandoMais(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 border-t border-line bg-surface-raised p-3 pb-20">
            {SECUNDARIOS.map((destino) => {
              const ativo = estaAtivo(destino.href, pathname);
              const Icone = destino.icone;

              return (
                <Link
                  key={destino.href}
                  href={destino.href}
                  onClick={() => setMostrandoMais(false)}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 text-xs tracking-default",
                    "transition-colors duration-200 ease-brand",
                    ativo ? "bg-surface-alt text-accent-ink" : "text-ink",
                  )}
                >
                  <Icone className="size-5 shrink-0" />
                  {destino.rotulo}
                </Link>
              );
            })}

            <button
              type="button"
              disabled={saindo}
              onClick={encerrarSessao}
              className="flex items-center gap-3 border-t border-line px-3 py-3 text-left text-xs text-ink-muted disabled:opacity-50"
            >
              <IconeSair className="size-5 shrink-0" />
              {saindo ? "Saindo" : "Sair"}
            </button>

            <span
              className="truncate px-3 pt-2 text-2xs text-ink-muted"
              title={usuario}
            >
              {usuario}
            </span>
          </div>
        </div>
      ) : null}

      {/* ---- Celular: barra fixa no rodapé ---- */}
      <nav
        aria-label="Navegação do painel"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-surface-alt lg:hidden"
      >
        {PRINCIPAIS.map((destino) => {
          const ativo = estaAtivo(destino.href, pathname);
          const Icone = destino.icone;

          return (
            <Link
              key={destino.href}
              href={destino.href}
              // A barra fica por cima da folha, então dá para tocar numa aba
              // com o "Mais" aberto. Sem isto ela chegaria em Cupons com a
              // folha ainda cobrindo a tela.
              onClick={() => setMostrandoMais(false)}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2",
                "transition-colors duration-200 ease-brand",
                ativo ? "text-ink" : "text-ink-muted",
              )}
            >
              <Icone className="size-5.5 shrink-0" />
              <span className="w-full truncate text-center text-2xs">
                {destino.rotulo}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-expanded={mostrandoMais}
          onClick={() => setMostrandoMais((v) => !v)}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2",
            "transition-colors duration-200 ease-brand",
            mostrandoMais || emSecundario ? "text-ink" : "text-ink-muted",
          )}
        >
          <IconeMais className="size-5.5 shrink-0" />
          <span className="w-full truncate text-center text-2xs">Mais</span>
        </button>
      </nav>
    </>
  );
}
