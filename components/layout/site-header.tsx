"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconeBusca, IconeFechar, IconeMenu } from "@/components/icons";
import { Container } from "@/components/ui";
import { NAVEGACAO_PRINCIPAL } from "@/lib/navigation";
import type { ColecaoDoMenu } from "./mobile-drawer";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";

/** A partir de quantos pixels de rolagem o header vira sólido. */
const LIMITE_SCROLL = 24;

/**
 * Header fixo.
 *
 * Na home ele começa transparente, sobre o hero, e vira sólido com um traço
 * sutil ao rolar. Nas demais rotas já nasce sólido, porque não existe hero
 * atrás dele.
 */
export interface SiteHeaderProps {
  /** Coleções do acervo, para o menu suspenso. Vêm do layout, que é servidor. */
  colecoes: ColecaoDoMenu[];
}

export function SiteHeader({ colecoes }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [colecoesAbertas, setColecoesAbertas] = useState(false);
  const [termo, setTermo] = useState("");
  const buscaRef = useRef<HTMLInputElement>(null);

  const ehHome = pathname === "/";
  const transparente = ehHome && !rolou && !buscaAberta;

  useEffect(() => {
    function aoRolar() {
      setRolou(window.scrollY > LIMITE_SCROLL);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Fecha o que estiver aberto ao trocar de pagina. Ajuste durante a render
  // em vez de efeito: com efeito, o menu apareceria aberto por um quadro na
  // pagina nova antes de fechar.
  const [rotaAnterior, setRotaAnterior] = useState(pathname);
  if (rotaAnterior !== pathname) {
    setRotaAnterior(pathname);
    setMenuAberto(false);
    setBuscaAberta(false);
  }

  useEffect(() => {
    if (buscaAberta) buscaRef.current?.focus();
  }, [buscaAberta]);

  const fecharMenu = useCallback(() => setMenuAberto(false), []);

  function aoBuscar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const limpo = termo.trim();
    if (!limpo) return;
    router.push(`/acervo?busca=${encodeURIComponent(limpo)}`);
    setBuscaAberta(false);
    setTermo("");
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full",
          "transition-colors duration-300 ease-soft",
          // A linha de 1px vem de `after`, fora do fluxo, para a altura do
          // header ser exatamente h-16. E dela que o hero desconta o -mt-16.
          "after:absolute after:inset-x-0 after:bottom-0 after:h-px",
          "after:transition-colors after:duration-300 after:ease-soft",
          transparente
            ? "bg-transparent text-ink-inverse after:bg-transparent"
            : "bg-surface text-ink after:bg-line",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-6 lg:flex"
          >
            {NAVEGACAO_PRINCIPAL.map((item) => {
              const ativo =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={ativo ? "page" : undefined}
                  className={cn(
                    "text-xs tracking-default",
                    "transition-colors duration-200 ease-brand hover:text-accent-ink",
                    ativo ? "text-accent-ink" : "text-current",
                  )}
                >
                  {item.rotulo}
                </Link>
              );

              // Coleções pendura no Acervo, que é a página delas. Um item
              // solto no menu levaria a lugar nenhum sozinho.
              if (item.href !== "/acervo" || !colecoes.length) return link;

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setColecoesAbertas(true)}
                  onMouseLeave={() => setColecoesAbertas(false)}
                >
                  <div className="flex items-center gap-1">
                    {link}
                    <button
                      type="button"
                      aria-expanded={colecoesAbertas}
                      aria-label="Ver as coleções"
                      onClick={() => setColecoesAbertas((v) => !v)}
                      className="text-current transition-colors duration-200 ease-brand hover:text-accent-ink"
                    >
                      <IconeSeta aberto={colecoesAbertas} />
                    </button>
                  </div>

                  {colecoesAbertas ? (
                    <ul className="absolute top-full left-0 z-40 flex w-56 flex-col border border-line bg-surface py-2 shadow-sm">
                      {colecoes.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={`/acervo?categoria=${c.slug}`}
                            onClick={() => setColecoesAbertas(false)}
                            className="block px-4 py-2 text-xs tracking-default text-ink transition-colors duration-200 ease-brand hover:text-accent-ink"
                          >
                            {c.nome}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBuscaAberta((v) => !v)}
              aria-expanded={buscaAberta}
              aria-controls="busca-header"
              className="flex size-9 items-center justify-center text-current transition-colors duration-200 ease-brand hover:text-accent-ink"
            >
              {buscaAberta ? <IconeFechar /> : <IconeBusca />}
              <span className="sr-only">
                {buscaAberta ? "Fechar busca" : "Buscar vestidos"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              aria-expanded={menuAberto}
              className="flex size-9 items-center justify-center text-current transition-colors duration-200 ease-brand hover:text-accent-ink lg:hidden"
            >
              <IconeMenu />
              <span className="sr-only">Abrir menu</span>
            </button>
          </div>
        </Container>

        {buscaAberta ? (
          <div id="busca-header" className="border-t border-line bg-surface">
            <Container className="py-3">
              <form onSubmit={aoBuscar} className="flex items-center gap-2">
                <label htmlFor="busca-termo" className="sr-only">
                  Buscar vestidos
                </label>
                <input
                  id="busca-termo"
                  ref={buscaRef}
                  type="search"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  placeholder="Buscar por nome do vestido"
                  className={cn(
                    "h-9 w-full rounded-none border border-line-strong bg-surface-raised px-3",
                    "text-xs tracking-default text-ink",
                    "transition-colors duration-200 ease-brand focus:border-ink focus:outline-none",
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "h-9 shrink-0 rounded-none border border-ink bg-ink px-4",
                    "text-xs tracking-caps uppercase text-ink-inverse",
                    "transition-colors duration-200 ease-brand",
                    "hover:bg-transparent hover:text-accent-ink",
                  )}
                >
                  Buscar
                </button>
              </form>
            </Container>
          </div>
        ) : null}
      </header>

      <MobileDrawer
        aberto={menuAberto}
        aoFechar={fecharMenu}
        itens={NAVEGACAO_PRINCIPAL}
        colecoes={colecoes}
        pathname={pathname}
      />
    </>
  );
}

/** Seta do menu de coleções. Gira ao abrir, para dizer que fechou. */
function IconeSeta({ aberto }: { aberto: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "size-3.5 transition-transform duration-200 ease-brand",
        aberto && "rotate-180",
      )}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
