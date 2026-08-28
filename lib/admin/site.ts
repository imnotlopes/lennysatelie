/**
 * Domínio público do site.
 *
 * Vive aqui porque três coisas dependem dele: o canonical de cada página, o
 * sitemap e o link de cupom que o painel manda a dona copiar. Errado, os três
 * apontam para um lugar que não existe.
 *
 * Vem de variável de ambiente para o primeiro deploy funcionar antes de o
 * domínio ser registrado: na Vercel o site nasce em algo como
 * `lennysatelie.vercel.app`, e sem isso o sitemap sairia apontando para um
 * endereço que ainda não resolve.
 *
 * `NEXT_PUBLIC_` é obrigatório: o formulário de configurações do painel é
 * componente de cliente e lê esta constante para montar o link do cupom.
 *
 * Sem a variável, cai no domínio definitivo — que é o certo depois que ele
 * estiver apontando para a Vercel.
 */
const PADRAO = "https://lennysatelie.com.br";

/** Tira a barra final, se alguém colar o endereço com ela. */
function normalizar(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export const SITE = normalizar(process.env.NEXT_PUBLIC_SITE_URL || PADRAO);
