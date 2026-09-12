import { Heading, estilosBotao } from "@/components/ui";
import { IconeAgulha, IconeCabide, IconeEtiqueta, IconeWhatsapp } from "@/components/icons";
import { linkWhatsapp } from "@/lib/whatsapp";

/** O que a loja parceira leva daqui. */
const O_QUE_OFERECEMOS = [
  {
    icone: IconeAgulha,
    titulo: "Confecção própria",
    detalhe:
      "As peças são feitas aqui, do molde ao acabamento. Você compra de quem costura, não de quem revende.",
  },
  {
    icone: IconeCabide,
    titulo: "Peça para o seu acervo",
    detalhe:
      "Modelos de noiva, madrinha, debutante e festa, para alugar ou vender na sua loja com a sua marca.",
  },
  {
    icone: IconeEtiqueta,
    titulo: "Atacado",
    detalhe:
      "Quantidade, modelo e prazo saem da conversa. Cada acervo tem um público, e a grade acompanha o seu.",
  },
];

/**
 * Parcerias com lojas e ateliês.
 *
 * POR QUE ESTA SEÇÃO EXISTE, E POR QUE NÃO FALA DE FOTÓGRAFO
 * ---------------------------------------------------------
 * O primeiro rascunho era permuta com fornecedor de festa — fotógrafo,
 * maquiadora, cerimonialista — que é o que costuma aparecer em site de
 * ateliê. Era chute meu.
 *
 * A parceria que EXISTE hoje é outra: a Lennys confecciona e vende no atacado
 * para lojas que alugam as peças ao cliente final. Já acontece com pelo menos
 * uma loja. A seção fala do que o ateliê de fato faz.
 *
 * De quebra, ela é a prova mais forte da confecção própria em todo o site:
 * dizer "os vestidos são feitos por nós" convence; dizer "outras lojas alugam
 * vestidos que saíram daqui" é a mesma frase com testemunha.
 *
 * O QUE NÃO ESTÁ ESCRITO AQUI, DE PROPÓSITO
 * -----------------------------------------
 * Preço, pedido mínimo, prazo de produção, frete e exclusividade por região.
 * Nada disso foi definido com a Lennys ainda, e número inventado em página
 * voltada para lojista é o tipo de coisa que ele cobra na primeira conversa.
 *
 * Em vez de preencher com promessa, o texto nomeia essas variáveis como o que
 * se combina no WhatsApp. Para quem compra no atacado isso não é evasiva: é a
 * pauta da conversa, e saber a pauta antes de chamar é útil.
 *
 * Quando a Lennys fechar as condições, elas entram aqui — e aí a seção ganha
 * o que hoje não pode ter.
 */
export function Parcerias({ whatsapp }: { whatsapp: string }) {
  return (
    <section id="parcerias" className="flex flex-col gap-8 border-t border-line pt-12">
      <div className="flex max-w-prose flex-col gap-3">
        <Heading as={2} size="display-sm" revelar rotulo="Para lojas e ateliês" filete>
          Vista o seu acervo com peças nossas
        </Heading>
        <p className="text-base leading-base text-ink-muted">
          Além de atender a noiva aqui em Jandira, nós confeccionamos para
          outras lojas. Se você tem um ateliê ou uma loja de aluguel e quer
          peças próprias sem montar uma confecção, é com a gente que você fala.
        </p>
      </div>

      <ul className="grid gap-6 md:grid-cols-3">
        {O_QUE_OFERECEMOS.map((item) => (
          <li key={item.titulo} className="flex flex-col gap-2">
            <item.icone className="size-5 text-accent-ink" />
            <h3 className="text-sm text-ink">{item.titulo}</h3>
            <p className="text-xs leading-base text-ink-muted">{item.detalhe}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 bg-surface-alt p-6 md:p-8">
        <h3 className="text-2xs tracking-caps uppercase text-ink-muted">
          O que combinamos na conversa
        </h3>
        {/* Estas são as variáveis reais de um pedido de atacado. Elas estão
            aqui como pauta, e não como resposta, porque as condições ainda não
            foram fechadas — ver o comentário no topo do arquivo. */}
        <ul className="grid gap-x-8 gap-y-3 text-sm leading-base text-ink md:grid-cols-2">
          <li>Quais modelos e em qual grade de tamanhos</li>
          <li>Quantidade do primeiro pedido</li>
          <li>Prazo de produção e de entrega</li>
          <li>Valores e forma de pagamento</li>
          <li>Como a peça chega até a sua cidade</li>
          <li>Reposição e novos modelos ao longo do ano</li>
        </ul>
        <p className="max-w-prose text-xs leading-base text-ink-muted">
          Cada loja tem um público e um orçamento, então não existe uma tabela
          que sirva para todas. A conversa começa por essas seis perguntas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={linkWhatsapp(
            whatsapp,
            "Ola! Tenho uma loja e gostaria de falar sobre confeccao de vestidos no atacado.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={estilosBotao({ size: "lg", className: "self-start" })}
        >
          <IconeWhatsapp />
          Falar sobre parceria
        </a>
        <p className="text-xs text-ink-muted">
          Conta quantas peças você pensa em levar e para que tipo de cliente.
          Com isso já dá para responder prazo e valor na mesma conversa.
        </p>
      </div>
    </section>
  );
}
