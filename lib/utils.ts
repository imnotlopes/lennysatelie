/**
 * Junta classes condicionalmente, descartando valores falsos.
 *
 * Implementação local e sem dependência externa. Não resolve conflito entre
 * classes Tailwind do mesmo grupo (ex.: `bg-surface` junto de `bg-accent`) —
 * nesse caso vence a que estiver depois no CSS gerado, não a que estiver
 * depois na string. Se isso virar problema real, avaliar `tailwind-merge`.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
