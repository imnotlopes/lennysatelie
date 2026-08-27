import { estilosBotao, Heading } from "@/components/ui";
import { getConfiguracoes } from "@/lib/queries";
import { linkWhatsapp } from "@/lib/whatsapp";

/** Faixa de fechamento: aluguel à distância pelo WhatsApp. */
export async function FaixaWhatsapp() {
  const { contato } = await getConfiguracoes();

  return (
    <section className="bg-surface-alt">
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-4 px-4 py-12 text-center lg:px-12">
        <Heading as={2} size="display-sm" revelar>
          Não consegue vir até o ateliê?
        </Heading>
        <p className="max-w-prose text-sm leading-base text-ink-muted">
          Alugue à distância pelo WhatsApp. A gente ajuda a escolher a peça,
          combina o tamanho e envia para a sua cidade.
        </p>
        <a
          href={linkWhatsapp(
            contato.whatsapp,
            "Oi! Queria alugar um vestido à distância.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg" })}
        >
          Falar no WhatsApp
        </a>
      </div>
    </section>
  );
}
