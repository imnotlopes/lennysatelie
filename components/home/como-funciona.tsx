import Link from "next/link";
import { Container, Heading, estilosBotao } from "@/components/ui";
import { PASSOS, type DestinoPasso } from "@/lib/como-funciona";
import { getConfiguracoes } from "@/lib/queries";
import { linkWhatsapp } from "@/lib/whatsapp";

/**
 * Os seis passos na home, em versão curta.
 *
 * O texto completo mora em `/como-funciona`. Aqui entra só o resumo de cada
 * passo: quem está na home veio ver vestido, não ler processo.
 */
export async function ComoFunciona() {
  const { contato } = await getConfiguracoes();
  const destino = montarDestinos(contato.whatsapp, contato.instagram);

  return (
    <section>
      <Container className="folha gap-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Heading
            as={2}
            size="display-sm"
            revelar
            rotulo="Do primeiro contato à festa"
            filete
          >
            Como funciona o nosso ateliê
          </Heading>
          <Link
            href="/como-funciona"
            className="text-xs text-ink underline underline-offset-4 transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            Ver o passo a passo completo
          </Link>
        </div>

        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PASSOS.map((passo, indice) => (
            <li key={passo.titulo} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <passo.icone className="size-5 shrink-0 text-accent-ink" />
                <span className="text-2xs tracking-caps uppercase text-ink-muted">
                  Passo {indice + 1}
                </span>
              </div>
              <h3 className="text-sm text-ink">{passo.titulo}</h3>
              <p className="text-xs leading-base text-ink-muted">
                {passo.resumo}
              </p>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-3">
          {PASSOS.filter((p) => p.acao.principal).map((passo) => (
            <Link
              key={passo.acao.rotulo}
              href={destino[passo.acao.destino]}
              className={estilosBotao({
                variant:
                  passo.acao.destino === "acervo" ? "outline" : "primary",
                size: "lg",
              })}
            >
              {passo.acao.rotulo}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Resolve cada destino simbólico no endereço de verdade. */
export function montarDestinos(
  whatsapp: string,
  instagram: string | null,
): Record<DestinoPasso, string> {
  return {
    whatsapp: linkWhatsapp(
      whatsapp,
      "Olá! Gostaria de agendar um horário para conhecer os vestidos.",
    ),
    acervo: "/acervo",
    instagram: instagram
      ? `https://instagram.com/${instagram.replace("@", "")}`
      : "/acervo",
    devolucao: "/perguntas-frequentes#devolucao",
  };
}
