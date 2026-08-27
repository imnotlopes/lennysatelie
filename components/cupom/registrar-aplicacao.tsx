"use client";

import { useEffect } from "react";
import { registrarCupomAplicado } from "@/app/actions/cupom";

export interface RegistrarAplicacaoProps {
  cupomId: string;
}

/**
 * Registra `cupom_aplicado` uma única vez por sessão.
 *
 * Sem a trava, o evento dispararia em cada página navegada com o cupom ativo
 * e a métrica de campanha viraria contagem de pageview.
 */
export function RegistrarAplicacao({ cupomId }: RegistrarAplicacaoProps) {
  useEffect(() => {
    const chave = `cupom-aplicado:${cupomId}`;
    try {
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {
      // Storage bloqueado: registra assim mesmo.
    }
    void registrarCupomAplicado(cupomId);
  }, [cupomId]);

  return null;
}
