import { SELOS } from "@/lib/selos";

/**
 * Selos de confiança, logo abaixo do botão de reserva.
 *
 * Ficam aqui porque é o momento da decisão: a cliente já viu a peça e o
 * preço, e a dúvida que sobra é sobre o serviço, não sobre o vestido.
 *
 * Linha fina e ícone pequeno, sem caixa colorida nem medalha — o design da
 * referência é discreto, e selo gritando desconfiança costuma produzir o
 * efeito contrário.
 */
export function Selos() {
  if (!SELOS.length) return null;

  return (
    <ul className="flex flex-col gap-3 border-t border-line pt-5">
      {SELOS.map((selo) => (
        <li key={selo.titulo} className="flex items-start gap-3">
          <selo.icone className="mt-0.5 size-4 shrink-0 text-accent-ink" />
          <div className="flex flex-col">
            <span className="text-xs text-ink">{selo.titulo}</span>
            <span className="text-2xs leading-base text-ink-muted">
              {selo.detalhe}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
