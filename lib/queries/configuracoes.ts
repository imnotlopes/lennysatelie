import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/lib/supabase/types";

export interface Contato {
  /** Só dígitos, com DDI. É o que o wa.me aceita. */
  whatsapp: string;
  telefone: string;
  email: string;
  endereco: string;
  /** Handle com arroba, ex.: "@lennys_atelie". */
  instagram: string;
  /** URL completa da página. Vazio esconde o ícone no rodapé. */
  facebook: string;
}

export interface WhatsappTemplate {
  mensagem: string;
}

export interface Configuracoes {
  contato: Contato;
  whatsappTemplate: WhatsappTemplate;
}

/**
 * Fallback usado quando a consulta falha ou a chave ainda não foi cadastrada.
 * O rodapé e o botão de WhatsApp nunca podem sumir por causa de um erro de
 * banco, então o site sempre tem para onde cair.
 */
const PADRAO: Configuracoes = {
  contato: {
    whatsapp: "5511958564840",
    telefone: "(11) 95856-4840",
    email: "atelielennys@gmail.com",
    endereco:
      "Rua Nicolau Mayevsky, 128 - Jardim Sol Nascente, Jandira, SP",
    instagram: "@lennys_atelie",
    facebook: "https://www.facebook.com/lennysatelie",
  },
  whatsappTemplate: {
    mensagem: "Oi! Vi o {produto} no site e queria saber sobre a locação. {link}",
  },
};

function comoObjeto(valor: Json | undefined): Record<string, unknown> {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : {};
}

/** A consulta crua. Envolvida pelo cache logo abaixo. */
async function lerConfiguracoes(): Promise<Configuracoes> {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("configuracoes")
      .select("chave, valor");

    if (error) {
      console.error("Falha ao ler configurações:", error.message);
      return PADRAO;
    }

    const porChave = new Map((data ?? []).map((l) => [l.chave, l.valor]));
    const contato = comoObjeto(porChave.get("contato"));
    const template = comoObjeto(porChave.get("whatsapp_template"));

    return {
      contato: { ...PADRAO.contato, ...contato } as Contato,
      whatsappTemplate: {
        ...PADRAO.whatsappTemplate,
        ...template,
      } as WhatsappTemplate,
    };
  } catch (erro) {
    console.error("Falha ao ler configurações:", erro);
    return PADRAO;
  }
}

/**
 * Lê as configurações que a dona do ateliê edita pelo painel: dados de
 * contato e template da mensagem do WhatsApp.
 *
 * Nunca lança. Campo ausente cai no padrão acima, chave por chave.
 *
 * ---
 *
 * Em cache porque o resultado é o mesmo para todo mundo e mudava a cada
 * visita de cada página: o rodapé, o botão flutuante e a mensagem do WhatsApp
 * pedem essas linhas em toda rota do site. Era uma ida ao banco por
 * carregamento, sem nada que justificasse.
 *
 * A tag `configuracoes` é limpa pelo painel quando a dona salva (ver
 * `app/actions/admin-geral.ts`), então a mudança aparece na hora — o prazo de
 * uma hora é só a rede de segurança.
 *
 * `unstable_cache` e não `use cache`: a diretiva nova do Next 16 exige ligar
 * `cacheComponents` no next.config, o que muda a semântica de renderização do
 * projeto inteiro. Não é mudança para fazer de passagem.
 */
export const getConfiguracoes = unstable_cache(
  lerConfiguracoes,
  ["configuracoes"],
  { revalidate: 3600, tags: ["configuracoes"] },
);
