import { SITE } from "@/lib/admin/site";

/**
 * A imagem que aparece quando alguém compartilha uma página do site.
 *
 * Importa mais aqui do que na maioria dos sites: o ateliê fecha tudo no
 * WhatsApp, então este é o cartão que a Lennys manda para a cliente. Sem ele o
 * link chega como um retângulo de texto cinza.
 *
 * Vive numa constante e não na convenção de arquivo do Next porque as páginas
 * definem o próprio `openGraph`, e nesse caso o Next substitui o bloco inteiro
 * do layout em vez de completá-lo — só a home recebia a imagem. Verificado no
 * HTML servido, não suposto.
 *
 * Gerada por `scripts/gerar-og.mjs`. Para trocar a foto, edite o script e rode
 * de novo: o tamanho e o contraste do texto já estão resolvidos lá.
 */
export const OG_IMAGEM = {
  url: `${SITE}/og.png`,
  width: 1200,
  height: 630,
  alt: "Lennys Ateliê, aluguel de vestidos de festa e noiva em Jandira, São Paulo.",
} as const;
