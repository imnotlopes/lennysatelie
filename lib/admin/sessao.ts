import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Exige sessão para ver a página. Sem ela, manda para o login.
 *
 * O middleware já barra `/admin`, então isto é a segunda tranca. Vale a pena
 * porque a primeira é uma só: se o middleware for contornado — e já houve
 * falha conhecida desse tipo no Next — as telas do painel renderizariam.
 *
 * A guarda mora aqui e não no layout de propósito. O layout envolve também a
 * tela de login, e redirecionar lá dentro mandaria o login para o login, em
 * laço. Aqui cada página protegida chama, e a de login simplesmente não chama.
 *
 * Usa `getUser`, que valida o token no servidor. `getSession` só lê o cookie e
 * daria para forjar — não serve para decidir acesso.
 */
export async function exigirSessao(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  return user;
}
