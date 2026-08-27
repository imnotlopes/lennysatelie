"use client";

import { useTransition } from "react";
import { removerCupom } from "@/app/actions/cupom";

/** Tira o cupom. Some do lugar assim que o servidor confirma. */
export function BotaoRemoverCupom() {
  const [pendente, iniciar] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => iniciar(() => void removerCupom())}
      className="text-2xs tracking-caps uppercase underline underline-offset-4 transition-opacity duration-200 ease-brand hover:opacity-70 disabled:opacity-50"
    >
      {pendente ? "Removendo" : "Remover"}
    </button>
  );
}
