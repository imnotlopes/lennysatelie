import { Esteira } from "@/components/home/esteira";
import { Container, Heading, estilosBotao } from "@/components/ui";
import {
  AVALIACOES_GOOGLE,
  PERFIL_GOOGLE,
  RESUMO,
  inicialDe,
  type AvaliacaoGoogle,
} from "@/lib/avaliacoes-google";
import { cn } from "@/lib/utils";

/**
 * Quanto tempo cada avaliação fica na tela antes de dar a vez.
 *
 * Seis segundos, e não os dois das capas de coleção: capa se olha, relato se
 * lê. Em dois segundos ninguém termina o mais longo daqui.
 */
const MS_POR_AVALIACAO = 6000;

export interface AvaliacoesGoogleProps {
  /** Sem o próprio Container, para quem já está dentro de um. */
  semContainer?: boolean;
}

/**
 * Avaliações do Google.
 *
 * POR QUE ESTE CARD NÃO SEGUE O DESIGN SYSTEM DO SITE
 * ---------------------------------------------------
 * É a única exceção proposital em todo o projeto, e ela tem motivo: o card
 * reproduz um componente que a visitante já viu dezenas de vezes fora daqui.
 * Estrela dourada, "G" colorido, selo azul e canto arredondado são o que faz
 * o cérebro dela ler "isto é do Google, não é o dono do site se elogiando".
 * Repintado no rosa e no creme da marca, vira só mais um depoimento, e o site
 * já tem uma seção desses logo abaixo.
 *
 * Por isso as cores do Google aqui são literais e ficam presas neste arquivo,
 * sem virar token: token é para o que se repete, e nada mais no site deve
 * usar estas cores.
 *
 * O que carrega a seção continua sendo o número — 132 avaliações com média
 * 5,0 é o ativo mais forte do ateliê, e a única coisa aqui que uma visitante
 * confere sozinha em dez segundos. Ele abre em tamanho de título; os relatos
 * vêm depois, como prova do que o número afirma.
 */
export function AvaliacoesGoogle({
  semContainer = false,
}: AvaliacoesGoogleProps) {
  if (!AVALIACOES_GOOGLE.length) return null;

  const conteudo = (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Heading as={2} size="display-sm" revelar rotulo="Quem já alugou" filete>
          A nota que elas deram
        </Heading>

        <div className="flex items-center gap-5">
          <span className="font-display text-display-sm leading-none text-ink">
            {RESUMO.notaEscrita}
          </span>
          <div className="flex flex-col gap-2">
            <Estrelas nota={RESUMO.nota} />
            <span className="text-2xs text-ink-muted">
              {RESUMO.total} avaliações no Google
            </span>
          </div>
        </div>
      </div>

      <Esteira
        itens={AVALIACOES_GOOGLE.map((avaliacao, i) => ({
          chave: String(i),
          rotulo: `Ver a avaliação de ${avaliacao.nome}`,
          conteudo: <Cartao avaliacao={avaliacao} />,
        }))}
        lugares={{ base: 1, sm: 2, lg: 3 }}
        ms={MS_POR_AVALIACAO}
        classeFileira="gap-4 sm:grid-cols-2 lg:grid-cols-3"
      />

      <a
        href={PERFIL_GOOGLE}
        target="_blank"
        rel="noopener noreferrer"
        className={estilosBotao({
          variant: "outline",
          size: "lg",
          className: "self-start",
        })}
      >
        Ver as {RESUMO.total} avaliações no Google
      </a>
    </>
  );

  if (semContainer) {
    return <section className="flex flex-col gap-8">{conteudo}</section>;
  }

  return (
    <Container as="section" className="folha-curta gap-8">
      {conteudo}
    </Container>
  );
}

/**
 * Um relato, no formato do Google.
 *
 * Altura travada. Os relatos variam muito de tamanho — um tem três linhas,
 * outro tem nove — e numa fileira que troca de conteúdo sozinha isso faria a
 * seção inteira mudar de altura a cada ciclo, empurrando o resto da página
 * para baixo enquanto a visitante lê.
 *
 * A altura foi medida pelo maior relato na tela mais estreita, que é onde o
 * texto quebra em mais linhas: a 375px o da Idaiane ocupa dez. O corte em
 * dez linhas é rede de segurança para o dia em que chegar um relato maior
 * que todos estes — hoje não corta nenhum.
 */
function Cartao({ avaliacao }: { avaliacao: AvaliacaoGoogle }) {
  return (
    <div className="relative h-full pt-11">
      <figure className="flex h-full min-h-97 flex-col items-center gap-3 rounded-google border border-line bg-surface-raised px-6 pt-14 pb-8 text-center">
        <figcaption className="flex flex-col gap-1">
          <span className="text-sm font-bold text-ink">{avaliacao.nome}</span>
          <span className="text-xs text-ink-faded">{avaliacao.quando}</span>
        </figcaption>

        <div className="flex items-center gap-2">
          <Estrelas nota={avaliacao.nota} dourada />
          <SeloVerificado />
        </div>

        {/* `my-auto`: com altura travada, relato curto deixava um vazio
            grande embaixo. Centrado na sobra, o vazio fica dividido e o
            cartão parece composto em vez de faltando conteúdo. */}
        <blockquote className="my-auto line-clamp-10 text-xs leading-base text-ink">
          {avaliacao.texto}
        </blockquote>
      </figure>

      <Avatar nome={avaliacao.nome} />
    </div>
  );
}

/**
 * Foto de perfil, à maneira do Google, com o "G" no canto.
 *
 * A foto real da pessoa não é usada: ela vem de servidor do Google, quebra
 * quando a autora troca a dela, e carregar imagem de terceiro em toda visita
 * contradiz a página de privacidade, que hoje declara o mapa como a única
 * coisa de fora no site inteiro. O círculo com a inicial é o mesmo recurso
 * que o próprio Google usa para quem não tem foto — e o nome embaixo, que é
 * o que dá credibilidade, está lá por extenso de qualquer forma.
 */
function Avatar({ nome }: { nome: string }) {
  return (
    <div className="absolute left-1/2 top-0 size-22 -translate-x-1/2">
      <span
        aria-hidden="true"
        className="flex size-full items-center justify-center rounded-full border-4 border-surface-raised bg-surface-alt font-display text-xl text-ink"
      >
        {inicialDe(nome)}
      </span>
      <span className="absolute -right-0.5 bottom-0.5 flex size-8 items-center justify-center rounded-full bg-surface-raised">
        <LogoGoogle />
      </span>
    </div>
  );
}

/**
 * O "G" de quatro cores.
 *
 * Desenhado em SVG e não carregado de servidor do Google: é uma requisição a
 * menos, não depende de rede de terceiro e respeita a mesma regra de
 * privacidade do avatar acima.
 */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/** O selo azul que o Google põe ao lado da nota de quem tem conta verificada. */
function SeloVerificado() {
  return (
    <span
      role="img"
      aria-label="Avaliação verificada pelo Google"
      className="inline-flex"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          fill="#1A73E8"
          d="M12 1.5l2.4 2 3.1-.3 1 3 2.7 1.6-1.2 2.9 1.2 2.9-2.7 1.6-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3L2.8 15l1.2-2.9L2.8 9.2l2.7-1.6 1-3 3.1.3z"
        />
        <path
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.2 12.2l2.6 2.6 5-5.2"
        />
      </svg>
    </span>
  );
}

/**
 * As estrelas.
 *
 * Uma imagem só, com rótulo dizendo a nota por extenso: cinco elementos
 * separados fariam o leitor de tela anunciar "estrela" cinco vezes seguidas,
 * o que não informa nada.
 *
 * `dourada` é o amarelo do Google, usado dentro do card. Fora dele, no resumo
 * da seção, as estrelas seguem o acento da marca.
 */
function Estrelas({ nota, dourada = false }: { nota: number; dourada?: boolean }) {
  return (
    <span role="img" aria-label={`${nota} de 5 estrelas`} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Estrela key={i} cheia={i <= Math.round(nota)} dourada={dourada} />
      ))}
    </span>
  );
}

const ESTRELA =
  "M12 2.5l2.9 5.9 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9z";

/** Amarelo do Google. Vive só aqui: nada mais no site usa esta cor. */
const DOURADO_GOOGLE = "#FBBC04";

function Estrela({ cheia, dourada }: { cheia: boolean; dourada: boolean }) {
  // Dentro do card a cor é literal; fora dele sai do token da marca, e aí
  // `currentColor` resolve pela classe de cor no próprio SVG.
  const cor = dourada ? DOURADO_GOOGLE : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        dourada ? "size-4" : "size-3",
        !dourada && (cheia ? "text-accent-ink" : "text-line-strong"),
      )}
      fill={cheia ? cor : "none"}
      stroke={cheia ? "none" : cor}
      strokeWidth={1.5}
    >
      <path d={ESTRELA} />
    </svg>
  );
}
