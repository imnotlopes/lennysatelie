/**
 * Leitura das variáveis do Supabase.
 *
 * Falha alto e cedo: sem as variáveis, o erro aponta o que fazer em vez de
 * estourar um "fetch failed" incompreensível lá na frente.
 */

function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Variável de ambiente ${nome} não definida. ` +
        `Copie .env.example para .env.local e preencha com os dados do seu projeto Supabase.`,
    );
  }
  return valor;
}

export function supabaseUrl(): string {
  return obrigatoria(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function supabaseAnonKey(): string {
  return obrigatoria(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
