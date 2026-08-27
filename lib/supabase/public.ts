import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente para leitura pública, sem sessão.
 *
 * Existe por causa de renderização estática. O cliente de `server.ts` lê
 * cookies, e `cookies()` é API dinâmica no Next: basta uma chamada no layout
 * para toda a árvore abaixo virar server-rendered on demand. Como as páginas
 * do site público leem exatamente o que a RLS libera para o papel `anon`, elas
 * não precisam de sessão nenhuma — e sem cookie o Next consegue gerar HTML
 * estático e revalidar por tempo.
 *
 * Use este cliente em tudo que for vitrine. Use o de `server.ts` quando
 * houver usuário logado, ou seja, no painel.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
