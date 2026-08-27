import type { DiaDeCliques } from "@/lib/queries/analytics";

export interface GraficoCliquesProps {
  dados: DiaDeCliques[];
}

const LARGURA = 720;
const ALTURA = 180;
const MARGEM = { topo: 12, direita: 8, baixo: 22, esquerda: 28 };

function rotuloDia(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/**
 * Cliques no WhatsApp por dia, nos últimos 30 dias.
 *
 * SVG à mão em vez de biblioteca de gráfico: é uma linha só, e uma dependência
 * de 50 kB para desenhar uma polilinha não se paga. Os números também vão numa
 * tabela escondida visualmente, para leitor de tela — gráfico sem alternativa
 * textual é conteúdo perdido.
 */
export function GraficoCliques({ dados }: GraficoCliquesProps) {
  const maximo = Math.max(1, ...dados.map((d) => d.cliques));
  const larguraUtil = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.baixo;
  const passo = dados.length > 1 ? larguraUtil / (dados.length - 1) : 0;

  const x = (i: number) => MARGEM.esquerda + i * passo;
  const y = (v: number) => MARGEM.topo + alturaUtil - (v / maximo) * alturaUtil;

  const linha = dados.map((d, i) => `${x(i)},${y(d.cliques)}`).join(" ");
  const area = `${MARGEM.esquerda},${MARGEM.topo + alturaUtil} ${linha} ${x(dados.length - 1)},${MARGEM.topo + alturaUtil}`;

  // Três marcas no eixo horizontal: primeiro, meio e último dia.
  const marcas = [0, Math.floor(dados.length / 2), dados.length - 1];

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="w-full"
        role="img"
        aria-label={`Cliques no WhatsApp por dia nos últimos ${dados.length} dias. Máximo de ${maximo} em um dia.`}
      >
        {/* Linhas de referência: zero, metade e máximo */}
        {[0, maximo / 2, maximo].map((valor) => (
          <g key={valor}>
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={y(valor)}
              y2={y(valor)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={MARGEM.esquerda - 6}
              y={y(valor) + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--color-ink-muted)"
            >
              {Math.round(valor)}
            </text>
          </g>
        ))}

        <polygon points={area} fill="var(--color-accent)" opacity="0.08" />
        <polyline
          points={linha}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {dados.map((d, i) =>
          d.cliques > 0 ? (
            <circle
              key={d.dia}
              cx={x(i)}
              cy={y(d.cliques)}
              r="2.5"
              fill="var(--color-accent)"
            >
              <title>{`${rotuloDia(d.dia)}: ${d.cliques} clique${d.cliques === 1 ? "" : "s"}`}</title>
            </circle>
          ) : null,
        )}

        {marcas.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={ALTURA - 6}
            textAnchor={i === 0 ? "start" : i === dados.length - 1 ? "end" : "middle"}
            fontSize="9"
            fill="var(--color-ink-muted)"
          >
            {rotuloDia(dados[i].dia)}
          </text>
        ))}
      </svg>

      <figcaption className="sr-only">
        <table>
          <caption>Cliques no WhatsApp por dia</caption>
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.dia}>
                <th scope="row">{rotuloDia(d.dia)}</th>
                <td>{d.cliques}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
