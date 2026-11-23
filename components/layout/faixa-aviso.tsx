import { avisoNoAr, type Aviso } from "@/lib/aviso";

export interface FaixaAvisoProps {
  aviso: Aviso;
}

/**
 * Faixa de recado do ateliê, no topo de toda página.
 *
 * Nasceu para a Black Friday de 2026, mas não fala de Black Friday em lugar
 * nenhum: texto, link e período vêm do painel. Serve igual para "fechado para
 * reforma" ou "agenda de dezembro lotada", e no ano que vem não precisa de
 * deploy.
 *
 * POR QUE ESCURA E PEQUENA
 * ------------------------
 * O pedido foi "sutil, mas todo mundo entende". As duas coisas brigam, e o
 * que resolve não é o tamanho: é a posição. Acima de tudo, em toda página de
 * entrada, ninguém deixa de ver.
 *
 * Então o volume pode baixar. Fundo `ink` com texto claro, caixa alta pequena
 * com espaçamento largo, que é a mesma tipografia dos rótulos do site
 * ("Jandira · São Paulo"). Lê-se como parte da marca, não como banner colado
 * por cima dela. Vermelho, amarelo e contagem regressiva fariam o contrário,
 * e num ateliê de alta costura preço gritado desvaloriza a peça.
 *
 * O `ink` também separa a faixa do banner de cupom, que é rosa. Quem já viu
 * a tarja rosa não confunde as duas.
 *
 * UMA FAIXA POR VEZ
 * -----------------
 * Quem decide é o layout: cupom aplicado ganha, porque é desconto concreto e
 * já valendo, enquanto o aviso é só convite. Duas tarjas empilhadas comeriam
 * meia tela de celular antes da primeira foto.
 *
 * O ATRASO DE ATÉ UMA HORA
 * ------------------------
 * `getConfiguracoes` fica uma hora em cache e o site revalida de hora em
 * hora. Ligar ou desligar pelo painel é imediato, porque o painel derruba a
 * etiqueta `configuracoes` ao salvar. Já a virada automática pela data de fim
 * não derruba nada, então a faixa pode sobreviver até uma hora depois da
 * meia-noite. Para um recado de campanha isso não tem consequência; se um dia
 * tiver, o caminho é a dona desligar na mão, não encurtar o cache do site
 * inteiro.
 */
/**
 * O mesmo recado, em linha, para usar dentro das páginas.
 *
 * A faixa do topo avisa que existe uma condição. Esta nota reaparece onde a
 * decisão acontece: na entrada do acervo, quando a visitante começa a
 * escolher, e na página do vestido, logo acima do botão de reservar.
 *
 * Reaproveita o texto da faixa de propósito. Dois textos diferentes para a
 * mesma campanha significariam dois campos no painel, duas chances de
 * esquecer um deles no ar e duas versões da mesma promessa circulando.
 *
 * Sem fundo e sem caixa: aqui ela divide espaço com foto e preço, e um
 * segundo bloco escuro no meio da página viraria anúncio. A barra em acento
 * marca que é recado do ateliê, e o resto é a tipografia de rótulo do site.
 */
export function NotaAviso({ aviso }: FaixaAvisoProps) {
  if (!avisoNoAr(aviso)) return null;

  return (
    <p className="border-l-2 border-accent pl-3 text-2xs tracking-caps text-balance uppercase text-accent-ink">
      {aviso.texto.trim()}
    </p>
  );
}

export function FaixaAviso({ aviso }: FaixaAvisoProps) {
  if (!avisoNoAr(aviso)) return null;

  const texto = aviso.texto.trim();
  const link = aviso.link.trim();

  // `text-balance` porque um recado curto em caixa alta quebra feio no
  // celular: sem ele a última palavra cai sozinha na segunda linha e a faixa
  // passa a parecer defeito. Com ele, as duas linhas saem do mesmo tamanho.
  const conteudo = (
    <span className="text-2xs tracking-caps text-balance uppercase">
      {texto}
    </span>
  );

  return (
    <div className="bg-ink text-ink-inverse">
      <div className="mx-auto flex w-full max-w-content items-center justify-center px-4 py-2 text-center lg:px-12">
        {link ? (
          <a
            href={link}
            className="underline decoration-ink-inverse/40 underline-offset-4 transition-colors duration-200 ease-brand hover:decoration-ink-inverse"
          >
            {conteudo}
          </a>
        ) : (
          conteudo
        )}
      </div>
    </div>
  );
}
