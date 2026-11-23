/**
 * A regra de quando a faixa de aviso aparece.
 *
 * Mora aqui, e não no componente, porque é regra de negócio: a dona liga o
 * aviso, escreve o período, e o site decide sozinho. Componente só renderiza.
 *
 * POR QUE COMPARAR TEXTO E NÃO `Date`
 * -----------------------------------
 * O servidor da Vercel roda em UTC. Um aviso que termina em "30/11" tem que
 * sair do ar quando vira dia 1º em São Paulo, não três horas antes. Montar
 * `Date` com a data do campo e comparar com `new Date()` erra essa virada em
 * todo fim de dia.
 *
 * Então o caminho é o contrário: descobre-se que dia é hoje no fuso de São
 * Paulo, em texto "AAAA-MM-DD", e compara-se texto com texto. Nesse formato a
 * ordem alfabética é a ordem cronológica, então `<=` basta e não existe fuso
 * para errar.
 */

export interface Aviso {
  /** A chave geral. Desligado aqui, nada aparece, mesmo dentro do período. */
  ativo: boolean;
  texto: string;
  /** Vazio deixa a faixa sem link, só informativa. */
  link: string;
  /** "AAAA-MM-DD". Vazio significa "desde sempre". */
  inicio: string;
  /** "AAAA-MM-DD", inclusivo: o dia escrito aqui ainda mostra. Vazio não tem fim. */
  fim: string;
}

export const AVISO_PADRAO: Aviso = {
  ativo: false,
  texto: "",
  link: "",
  inicio: "",
  fim: "",
};

/** Que dia é hoje em São Paulo, no formato "AAAA-MM-DD". */
export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/**
 * Se a faixa deve aparecer agora.
 *
 * Texto vazio derruba o aviso mesmo ligado: faixa sem recado é só uma tarja
 * escura no topo do site, pior que nada.
 */
export function avisoNoAr(aviso: Aviso, hoje = hojeEmSaoPaulo()): boolean {
  if (!aviso.ativo) return false;
  if (!aviso.texto.trim()) return false;
  if (aviso.inicio && hoje < aviso.inicio) return false;
  if (aviso.fim && hoje > aviso.fim) return false;
  return true;
}
