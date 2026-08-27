import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente para uso no browser, dentro de Client Components.
 *
 * Só enxerga o que a RLS libera para o papel `anon` (ou para o usuário logado,
 * quando houver sessão). Na prática o site público quase não precisa dele: as
 * leituras acontecem no servidor. Ele existe para o painel da Etapa 8.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
