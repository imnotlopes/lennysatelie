import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente para uso no servidor: Server Components, Route Handlers e Server
 * Actions.
 *
 * Precisa ser criado a cada requisição, nunca guardado em variável de módulo,
 * porque carrega os cookies de sessão de um usuário específico.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component não pode escrever cookie. Quando a renovação de
          // sessão for necessária, ela acontece no middleware da Etapa 8.
        }
      },
    },
  });
}
