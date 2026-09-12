import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_CUPOM, CUPOM_MAX_AGE, cupomEhValido } from "@/lib/cupom";
import { HOST_LINKS, SITE } from "@/lib/admin/site";

/**
 * Middleware do site. Faz três coisas, nesta ordem:
 *
 * 1. Separa o subdomínio da página de links do site principal
 * 2. Captura do cupom de influenciadora (`?cupom=`), em qualquer rota
 * 3. Proteção das rotas de /admin
 *
 * A ordem importa duas vezes. O subdomínio vem primeiro porque nada do site
 * principal deve rodar nele — nem captura de cupom, nem painel. E a captura do
 * cupom termina em redirect, que precisa sair antes de qualquer checagem de
 * sessão, senão a visitante que chega pelo link da influenciadora perderia o
 * cupom no caminho.
 */
export async function middleware(request: NextRequest) {
  const respostaLinks = tratarSubdominioDeLinks(request);
  if (respostaLinks) return respostaLinks;

  const respostaCupom = await tratarCupom(request);
  if (respostaCupom) return respostaCupom;

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return protegerAdmin(request);
  }

  return NextResponse.next();
}

/* -------------------------------------------------------------------------- */
/* Subdomínio da página de links                                              */
/* -------------------------------------------------------------------------- */

/**
 * `links.lennysatelie.com.br` serve UMA página, e só ela.
 *
 * A raiz do subdomínio é reescrita para `/links`. Reescrita e não redirect: a
 * pessoa continua vendo o endereço limpo, sem `/links` grudado no fim.
 *
 * TODO O RESTO REDIRECIONA PARA O DOMÍNIO PRINCIPAL, e esta é a linha que
 * importa de verdade. Sem ela, o mesmo aplicativo responde o site inteiro nos
 * dois endereços: `links.lennysatelie.com.br/acervo` serviria as 240 peças, e
 * o Google veria duas cópias do site competindo entre si. O objetivo do
 * subdomínio é somar alcance; sem este redirect ele subtrai.
 *
 * 308 e não 302: o destino é permanente e o Google precisa consolidar o valor
 * no domínio principal, em vez de manter as duas URLs no índice.
 *
 * Caminho com ponto passa direto — `robots.txt`, `sitemap.xml`, `icon.png`.
 * Esses precisam existir no subdomínio por si, e os dois primeiros respondem
 * conforme o host (ver `app/robots.ts` e `app/sitemap.ts`).
 *
 * Devolve `null` quando a requisição não é do subdomínio, para o fluxo seguir.
 */
function tratarSubdominioDeLinks(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  if (!host || host !== HOST_LINKS) return null;

  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/links";
    return NextResponse.rewrite(url);
  }

  if (pathname.includes(".")) return NextResponse.next();

  return NextResponse.redirect(new URL(`${pathname}${search}`, SITE), 308);
}

/* -------------------------------------------------------------------------- */
/* Cupom de influenciadora                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A influenciadora divulga `www.lennysatelie.com.br/acervo?cupom=GIOVANNA`. O
 * código é validado contra o banco e guardado em cookie por 30 dias — a
 * cliente pode voltar depois, por outro caminho, e o desconto continua
 * valendo. É isso que transforma o cupom em métrica de campanha.
 *
 * Cupom inválido some em silêncio: a cliente não tem culpa de um link velho e
 * não ganha nada com uma mensagem de erro.
 *
 * Devolve `null` quando não há nada a fazer, para o fluxo seguir.
 */
async function tratarCupom(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("cupom");

  // Sem parâmetro, nenhuma consulta ao banco acontece.
  if (!codigo) return null;

  const url = request.nextUrl.clone();
  url.searchParams.delete("cupom");
  const resposta = NextResponse.redirect(url);

  const limpo = codigo.trim().toUpperCase();
  if (!limpo) return resposta;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data } = await supabase
      .from("cupons")
      .select("codigo, ativo, inicio, validade, limite_usos, usos")
      .eq("codigo", limpo)
      .maybeSingle();

    if (data && cupomEhValido(data)) {
      resposta.cookies.set(COOKIE_CUPOM, data.codigo, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: CUPOM_MAX_AGE,
        path: "/",
      });
    }
  } catch (erro) {
    // Banco fora do ar não pode impedir a navegação: segue sem cupom.
    console.error("Falha ao validar cupom no middleware:", erro);
  }

  return resposta;
}

/* -------------------------------------------------------------------------- */
/* Proteção do painel                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Exige sessão do Supabase para tudo em /admin, menos o próprio login.
 *
 * Além de barrar, este trecho renova o token de sessão a cada navegação: sem
 * isso a dona do ateliê seria deslogada no meio do cadastro de uma peça.
 */
async function protegerAdmin(request: NextRequest) {
  const ehLogin = request.nextUrl.pathname === "/admin/login";
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          resposta = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            resposta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getUser` valida o token no servidor. `getSession` só lê o cookie e daria
  // para forjar — não serve para decidir acesso.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !ehLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Já logada, não faz sentido ver o formulário de login.
  if (user && ehLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return resposta;
}

export const config = {
  // Roda em tudo que for página. Fora: assets, imagens otimizadas e favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|marca|placeholders).*)"],
};
