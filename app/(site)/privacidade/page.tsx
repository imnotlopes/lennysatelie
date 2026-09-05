import type { Metadata } from "next";
import Link from "next/link";
import { Container, Heading } from "@/components/ui";
import { getConfiguracoes } from "@/lib/queries";
import { SITE } from "@/lib/admin/site";
import { OG_IMAGEM } from "@/lib/seo";

const TITULO = "Privacidade | Lennys Ateliê";
const DESCRICAO =
  "O que o site do Lennys Ateliê coleta, o que não coleta e como pedir para apagar seus dados.";
const CAMINHO = "/privacidade";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE}${CAMINHO}` },
  openGraph: {
    images: [OG_IMAGEM],
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE}${CAMINHO}`,
    siteName: "Lennys Ateliê",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
  },
};

/**
 * Aviso de privacidade.
 *
 * Escrito a partir do que o código faz de fato, não de um modelo genérico:
 * cada afirmação aqui foi conferida no site antes de virar frase. O formulário
 * de reserva não grava nada, a tabela de eventos não guarda identificador
 * nenhum e existe um cookie só. É pouca coisa, e dizer pouco é o correto —
 * política que promete controles que não existem é pior que não ter política.
 *
 * Em linguagem simples, como o resto do site. Quem lê isto é uma cliente
 * decidindo se manda mensagem, não um departamento jurídico.
 */
export default async function PrivacidadePage() {
  const { contato } = await getConfiguracoes();

  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <header className="flex max-w-prose flex-col gap-3">
        <Heading as={1} size="display-md" revelar rotulo="Seus dados" filete>
          Privacidade
        </Heading>
        <p className="text-sm leading-base text-ink-muted">
          Este site foi feito para mostrar vestidos e levar a conversa para o
          WhatsApp. Ele coleta muito pouco, e esta página diz exatamente o quê.
        </p>
      </header>

      <Bloco titulo="Quem é responsável">
        <p>
          Lennys Ateliê, em {contato.endereco}. Para qualquer assunto desta
          página, incluindo pedido de exclusão, fale pelo{" "}
          <a
            href={`mailto:${contato.email}`}
            className="text-ink underline underline-offset-4 hover:text-accent-ink"
          >
            {contato.email}
          </a>{" "}
          ou pelo WhatsApp {contato.telefone}.
        </p>
      </Bloco>

      <Bloco titulo="O que o site não faz">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Não pede cadastro, login nem senha para navegar.</li>
          <li>Não guarda seu nome, telefone ou e-mail em banco de dados.</li>
          <li>
            Não usa Google Analytics, pixel do Facebook nem rastreadores de
            publicidade.
          </li>
          <li>Não vende nem compartilha dados com anunciantes.</li>
        </ul>
      </Bloco>

      <Bloco titulo="O formulário de reserva">
        <p>
          Na página de cada vestido existe um formulário com tamanho e data. Ele{" "}
          <strong className="font-normal text-ink">não envia nada</strong> para
          nós: o que você escreve fica no seu próprio navegador e serve só para
          montar a mensagem que abre no WhatsApp, já preenchida.
        </p>
        <p>
          A partir do momento em que você toca em enviar, a conversa passa a ser
          um WhatsApp comum entre você e o ateliê, com as regras de privacidade
          do próprio WhatsApp.
        </p>
      </Bloco>

      <Bloco titulo="Cookies">
        <p>
          Um só, chamado <code className="text-ink">lennys_cupom</code>. Ele
          aparece apenas se você chega ao site por um link de divulgação com
          cupom, e guarda o código do cupom por 30 dias para o desconto
          continuar valendo se você voltar depois.
        </p>
        <p>
          Não guarda quem você é. Para removê-lo, basta limpar os cookies do
          site no seu navegador — o site continua funcionando igual, só sem o
          desconto aplicado automaticamente.
        </p>
      </Bloco>

      <Bloco titulo="O mapa">
        <p>
          Na página inicial e no contato existe um mapa do Google mostrando onde
          fica o ateliê. É a única coisa de terceiro no site: ao carregar o
          mapa, seu navegador fala com o Google, que pode registrar esse acesso
          segundo as regras dele.
        </p>
        <p>
          O mapa só carrega quando você chega perto dele na página. Se você não
          rolar até lá, nada é solicitado ao Google.
        </p>
      </Bloco>

      <Bloco titulo="O que medimos">
        <p>
          Registramos quantas vezes um vestido foi visto e quantas vezes o botão
          de WhatsApp foi tocado. O registro guarda o tipo do evento e qual
          vestido — nada que identifique você, nem endereço de internet, nem
          aparelho.
        </p>
      </Bloco>

      <Bloco titulo="Depoimentos de clientes">
        <p>
          As mensagens e fotos de clientes que aparecem no site foram publicadas
          com autorização de cada uma. Se você é uma delas e quer que a sua saia
          do ar, escreva para{" "}
          <a
            href={`mailto:${contato.email}`}
            className="text-ink underline underline-offset-4 hover:text-accent-ink"
          >
            {contato.email}
          </a>{" "}
          — tiramos sem pedir explicação.
        </p>
      </Bloco>

      <Bloco titulo="Onde as informações ficam">
        <p>
          As fotos e os textos do site ficam hospedados em serviços de
          infraestrutura contratados para isso (Vercel e Supabase), que os
          armazenam em nosso nome e não os usam para outra finalidade.
        </p>
      </Bloco>

      <Bloco titulo="Seus direitos">
        <p>
          A Lei Geral de Proteção de Dados garante a você pedir acesso, correção
          ou exclusão dos seus dados, e saber com quem eles foram
          compartilhados. Como este site guarda pouquíssima coisa, na prática o
          pedido mais comum é sobre uma conversa de WhatsApp ou um depoimento
          publicado. Escreva e resolvemos.
        </p>
      </Bloco>

      <p className="text-2xs text-ink-muted">
        Se algo aqui não estiver claro, pergunte pelo{" "}
        <Link
          href="/contato"
          className="text-ink underline underline-offset-4 hover:text-accent-ink"
        >
          contato
        </Link>
        .
      </p>
    </Container>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex max-w-prose flex-col gap-3">
      <Heading as={2} size="xl">
        {titulo}
      </Heading>
      <div className="flex flex-col gap-3 text-sm leading-base text-ink-muted">
        {children}
      </div>
    </section>
  );
}
