import { descontoLegivel } from "@/lib/cupom";
import type { CupomPublico } from "@/lib/supabase/types";
import { BotaoRemoverCupom } from "./botao-remover-cupom";
import { RegistrarAplicacao } from "./registrar-aplicacao";

export interface BannerCupomProps {
  cupom: CupomPublico;
}

/**
 * Faixa de cupom ativo, acima do header.
 *
 * Fica no topo do fluxo, não fixa: uma faixa fixa comeria altura de tela no
 * celular, que é onde a maioria das clientes chega pelo link da
 * influenciadora.
 */
export function BannerCupom({ cupom }: BannerCupomProps) {
  const nome = cupom.influenciadora_nome?.trim();

  return (
    <div className="bg-accent text-ink">
      <RegistrarAplicacao cupomId={cupom.id} />
      <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 lg:px-12">
        <p className="text-xs tracking-default">
          Cupom <strong className="font-bold">{cupom.codigo}</strong>
          {nome ? ` de ${nome}` : ""} aplicado:{" "}
          {descontoLegivel(cupom)} de desconto
        </p>
        <BotaoRemoverCupom />
      </div>
    </div>
  );
}
