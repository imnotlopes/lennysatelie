import {
  IconeCabide,
  IconeEmail,
  IconeFacebook,
  IconeGlobo,
  IconeInstagram,
  IconeWhatsapp,
} from "@/components/icons";
import type { IconeLink } from "@/lib/supabase/types";

/**
 * Nome guardado no banco para o desenho em SVG.
 *
 * A lista é fechada em três lugares ao mesmo tempo: no CHECK da tabela `links`,
 * no tipo `IconeLink` e aqui. Acrescentar um ícone é mexer nos três — o preço
 * de desenhar os ícones em vez de depender de biblioteca.
 *
 * Mora num arquivo próprio porque dois componentes usam o mesmo mapa: o card
 * da lista e a fileira de atalhos do rodapé. Duplicar abriria a porta para os
 * dois discordarem sobre o que é "site".
 */
export const ICONES_LINK: Record<IconeLink, typeof IconeWhatsapp> = {
  whatsapp: IconeWhatsapp,
  instagram: IconeInstagram,
  facebook: IconeFacebook,
  site: IconeGlobo,
  acervo: IconeCabide,
  email: IconeEmail,
};
