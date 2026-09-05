import { SITE } from "@/lib/admin/site";
import { horariosParaSchema } from "@/lib/horarios";
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
      "Ateliê de aluguel de vestido de noiva, casamento civil, cerimônia e festa em Jandira, São Paulo.",
    url: SITE,
    telephone: `+${contato.whatsapp}`,
    email: contato.email,
    // A imagem de compartilhamento, e não o símbolo da marca: o Google pede
    // imagem grande aqui, e o símbolo tem 102x160.
    image: `${SITE}/og.png`,
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
    openingHoursSpecification: horariosParaSchema(),
    priceRange: "$$",
    // Link para o ponto no mapa. Ajuda o Google a casar o endereço declarado
    // aqui com a ficha do negócio no Maps.
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      "Lennys Ateliê, Rua Nicolau Mayevsky, 128 - Jardim Sol Nascente, Jandira, SP",
    )}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
