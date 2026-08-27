"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface EstadoLogin {
  erro?: string;
}

/**
 * Entrada no painel.
 *
 * A mensagem de erro é sempre a mesma, sem distinguir "e-mail não existe" de
 * "senha errada": além de não ajudar quem erra de verdade, distinguir os dois
 * entrega para um estranho quais e-mails têm conta.
 *
 * Não existe cadastro público. O acesso da dona do ateliê é criado à mão no
 * painel do Supabase.
 */
export async function entrar(
  _anterior: EstadoLogin,
  dados: FormData,
): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { erro: "E-mail ou senha não conferem. Tente de novo." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
