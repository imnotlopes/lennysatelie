import { PainelLinks } from "@/components/admin/painel-links";
import { getLinksDoPainel } from "@/lib/queries";
import { exigirSessao } from "@/lib/admin/sessao";
import { SITE_LINKS } from "@/lib/admin/site";

/**
 * A página de links, editada aqui dentro.
 *
 * Fica no painel do site e não num painel próprio no subdomínio: a Lennys é
 * uma pessoa só, e o cookie de sessão é por origem — painel separado seria ela
 * entrar duas vezes, com a mesma senha, em dois lugares que parecem o mesmo
 * sistema.
 */
export default async function LinksAdminPage() {
  await exigirSessao();

  const links = await getLinksDoPainel();

  return (
    <main className="flex flex-col gap-8 p-6 lg:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-display-sm leading-tight text-ink">
          Página de links
        </h1>
        <p className="max-w-prose text-xs leading-base text-ink-muted">
          Os botões que aparecem no link da sua bio. O que você mudar aqui entra
          no ar na hora.
        </p>
        <a
          href={SITE_LINKS}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-2xs tracking-caps uppercase text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
        >
          Ver a página
        </a>
      </header>

      <PainelLinks links={links} />
    </main>
  );
}
