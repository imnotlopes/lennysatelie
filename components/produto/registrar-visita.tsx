"use client";

import { useEffect } from "react";
import { registrarVisitaProduto } from "@/app/actions/produto";

export interface RegistrarVisitaProps {
  produtoId: string;
}

/**
 * Registra uma visita ao produto, no máximo uma vez por sessão por peça.
 *
 * A trava é `sessionStorage`: sem ela, cada volta da cliente para a mesma
 * página inflaria a contagem e a métrica de campanha da Etapa 7 perderia o
 * sentido.
 *
 * Não renderiza nada.
 */
export function RegistrarVisita({ produtoId }: RegistrarVisitaProps) {
  useEffect(() => {
    const chave = `visita:${produtoId}`;
    try {
      if (sessionStorage.getItem(chave)) return;
      sessionStorage.setItem(chave, "1");
    } catch {
      // Navegador com storage bloqueado: registra assim mesmo, sem trava.
    }
    void registrarVisitaProduto(produtoId);
  }, [produtoId]);

  return null;
}
