import Link from "next/link";
import {
  IconeFacebook,
  IconeInstagram,
  IconeWhatsapp,
} from "@/components/icons";
import { Container } from "@/components/ui";
import { getConfiguracoes } from "@/lib/queries";
import { NAVEGACAO_PRINCIPAL } from "@/lib/navigation";
import { linkWhatsapp } from "@/lib/whatsapp";
import { Logo } from "./logo";

/**
 * Server Component: lê os dados de contato do banco.
 *
 * `getConfiguracoes()` nunca lança e cai em valores padrão campo a campo, então
 * o rodapé não some por causa de falha de consulta.
 */
export async function SiteFooter() {
  const { contato } = await getConfiguracoes();
  const instagramUrl = `https://instagram.com/${contato.instagram.replace("@", "")}`;
  // Os links de texto do rodapé tinham 19px de altura: a altura da linha, e
  // nada mais. No celular o dedo erra. `min-h-9` dá 45px de área tocável sem
  // mexer no tamanho da fonte nem no visual — o texto só passa a ficar
  // centrado numa caixa maior. No desktop, onde quem aponta é o cursor, a
  // altura volta ao natural e o rodapé não incha.
  const linkRodape =
    "flex min-h-9 items-center text-xs text-ink-muted transition-colors duration-200 ease-brand hover:text-accent-ink sm:min-h-0";
  const social = "flex size-9 items-center justify-center border border-line-strong text-ink transition-colors duration-200 ease-brand hover:border-accent hover:text-accent-ink";
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-surface-alt">
      <Container className="grid gap-8 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo />
          <address className="flex flex-col gap-1 text-xs not-italic text-ink-muted">
            <span>{contato.endereco}</span>
            <a
              href={`tel:${contato.telefone.replace(/\D/g, "")}`}
              className={linkRodape}
            >
              {contato.telefone}
            </a>
            <a href={`mailto:${contato.email}`} className={linkRodape}>
              {contato.email}
            </a>
          </address>
        </div>

        <nav aria-label="Navegação do rodapé" className="flex flex-col gap-2">
          <h2 className="text-xs font-bold tracking-default text-ink">
            Navegue
          </h2>
          {NAVEGACAO_PRINCIPAL.map((item) => (
            <Link key={item.href} href={item.href} className={linkRodape}>
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold tracking-default text-ink">
            Acompanhe
          </h2>
          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={social}
            >
              <IconeInstagram />
              <span className="sr-only">
                Instagram do ateliê, abre em nova aba
              </span>
            </a>
            {contato.facebook ? (
              <a
                href={contato.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={social}
              >
                <IconeFacebook />
                <span className="sr-only">
                  Facebook do ateliê, abre em nova aba
                </span>
              </a>
            ) : null}
            <a
              href={linkWhatsapp(contato.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={social}
            >
              <IconeWhatsapp className="size-4" />
              <span className="sr-only">
                WhatsApp do ateliê, abre em nova aba
              </span>
            </a>
          </div>
          <p className="text-xs text-ink-muted">{contato.instagram}</p>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="py-4">
          <p className="text-2xs text-ink-muted">
            {ano} Lennys Ateliê. Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
