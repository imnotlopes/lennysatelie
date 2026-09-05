import { Container, Heading, estilosBotao } from "@/components/ui";
import { HORARIOS } from "@/lib/horarios";
import type { Contato } from "@/lib/queries";

export interface MapaAtelieProps {
  contato: Contato;
  /** Sem o próprio título e respiro, para quem já está numa seção. */
  semCabecalho?: boolean;
}

/**
 * Onde fica o ateliê, com mapa.
 *
 * Endereço, telefone e horário à esquerda; mapa à direita. Para quem está
 * decidindo se atravessa a cidade, ver o ponto no mapa responde mais rápido
 * que ler o nome da rua.
 *
 * SOBRE O SEO
 * -----------
 * O mapa em si o Google não lê — quem faz o trabalho é o bloco de dados
 * estruturados na home, que declara endereço, telefone e horário em formato
 * de máquina. O mapa é para a visitante. Vale a pena não confundir os dois:
 * trocar o bloco de dados por um mapa pioraria o SEO, não melhoraria.
 *
 * SOBRE PRIVACIDADE
 * -----------------
 * O quadro é do Google e, ao carregar, o navegador da visitante fala com o
 * Google. É a única coisa de terceiro no site inteiro, e por isso está dito
 * na página de privacidade. `loading="lazy"` segura o carregamento até a
 * pessoa chegar perto — quem não rolar até aqui não conversa com ninguém.
 */
export function MapaAtelie({ contato, semCabecalho = false }: MapaAtelieProps) {
  const endereco = contato.endereco;
  const consulta = encodeURIComponent(`Lennys Ateliê, ${endereco}`);
  const comoChegar = `https://www.google.com/maps/dir/?api=1&destination=${consulta}`;

  const corpo = (
    <div className="grid overflow-hidden border border-line bg-surface-raised lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 lg:p-10">
        <span className="font-display text-xl tracking-default text-ink">
          Lennys Ateliê
        </span>

        <Dado rotulo="Endereço">{endereco}</Dado>

        <Dado rotulo="Telefone">
          <a
            href={`tel:${contato.telefone.replace(/\D/g, "")}`}
            className="transition-colors duration-200 ease-brand hover:text-accent-ink"
          >
            {contato.telefone}
          </a>
        </Dado>

        <div className="flex flex-col gap-2">
          <span className="text-2xs tracking-caps uppercase text-ink-muted">
            Atendimento
          </span>
          <dl className="flex flex-col gap-1">
            {HORARIOS.map((h) => (
              <div key={h.dias} className="flex justify-between gap-4 text-xs">
                <dt className="text-ink-muted">{h.dias}</dt>
                <dd className="text-ink">{h.horas}</dd>
              </div>
            ))}
          </dl>
        </div>

        <a
          href={comoChegar}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg", className: "self-start" })}
        >
          Como chegar
        </a>
      </div>

      {/* Proporção travada: sem altura definida o quadro nasce com zero e a
          seção cresce de repente quando o mapa carrega. */}
      <div className="relative min-h-75 lg:min-h-0">
        <iframe
          title={`Mapa com a localização do Lennys Ateliê em ${endereco}`}
          src={`https://www.google.com/maps?q=${consulta}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </div>
  );

  if (semCabecalho) return corpo;

  return (
    <Container as="section" className="folha gap-6">
      <Heading as={2} size="display-sm" revelar rotulo="Onde estamos" filete>
        Visite o ateliê
      </Heading>
      {corpo}
    </Container>
  );
}

function Dado({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xs tracking-caps uppercase text-ink-muted">
        {rotulo}
      </span>
      <span className="text-sm leading-base text-ink">{children}</span>
    </div>
  );
}
