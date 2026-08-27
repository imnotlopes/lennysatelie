import { SITE } from "@/lib/admin/site";
import type { Contato } from "@/lib/queries";

/**
 * Dados estruturados do ateliê, para a home.
 *
 * É o que faz o Google mostrar endereço, telefone e horário direto no
 * resultado de busca — e o que faz "aluguel de vestido em Jandira" encontrar
 * a Lennys. Para um negócio local, isso pesa mais que qualquer outra coisa
 * de SEO.
 *
 * O horário está fixo aqui porque a tabela `configuracoes` ainda não guarda
 * esse dado. Vale mover para lá quando a dona precisar mudar sozinha.
 */
export function LocalBusinessJsonLd({ contato }: { contato: Contato }) {
  const dados = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Lennys Ateliê",
    description:
      "Ateliê de locação de vestidos de festa, noiva e casamento civil em Jandira, São Paulo.",
    url: SITE,
    telephone: `+${contato.whatsapp}`,
    email: contato.email,
    image: `${SITE}/marca/simbolo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua Nicolau Mayevsky, 128 - Jardim Sol Nascente",
      addressLocality: "Jandira",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    sameAs: [
      contato.instagram
        ? `https://instagram.com/${contato.instagram.replace("@", "")}`
        : null,
      contato.facebook || null,
    ].filter(Boolean),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
