"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { sair } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/admin", rotulo: "Dashboard" },
  { href: "/admin/produtos", rotulo: "Produtos" },
  { href: "/admin/categorias", rotulo: "Categorias" },
  { href: "/admin/cupons", rotulo: "Cupons" },
  { href: "/admin/configuracoes", rotulo: "Configurações" },
];

export interface SidebarProps {
  /** Aparece no rodapé da sidebar. É o e-mail da conta. */
  usuario: string;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const [saindo, iniciar] = useTransition();

  return (
    <nav
      aria-label="Navegação do painel"
      className="flex shrink-0 flex-row items-center gap-2 overflow-x-auto border-b border-line bg-surface-alt px-4 py-2 lg:w-56 lg:flex-col lg:items-stretch lg:overflow-visible lg:border-r lg:border-b-0 lg:px-3 lg:py-4"
    >
      <span className="hidden px-2 pb-4 font-display text-lg leading-none text-ink lg:block">
        Lennys Ateliê
      </span>

      <ul className="flex flex-row gap-1 lg:flex-1 lg:flex-col">
        {ITENS.map((item) => {
          const ativo =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "block whitespace-nowrap px-3 py-2 text-xs tracking-default",
                  "transition-colors duration-200 ease-brand",
                  ativo
                    ? "bg-surface-raised text-accent-ink"
                    : "text-ink hover:text-accent-ink",
                )}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch lg:gap-1 lg:border-t lg:border-line lg:pt-3">
        <span
          className="hidden truncate px-3 text-2xs text-ink-muted lg:block"
          title={usuario}
        >
          {usuario}
        </span>
        <button
          type="button"
          disabled={saindo}
          onClick={() => iniciar(() => void sair())}
          className="px-3 py-2 text-left text-2xs tracking-caps uppercase text-ink-muted transition-colors duration-200 ease-brand hover:text-accent-ink disabled:opacity-50"
        >
          {saindo ? "Saindo" : "Sair"}
        </button>
      </div>
    </nav>
  );
}
