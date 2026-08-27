"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Tom = "sucesso" | "erro";

interface Aviso {
  id: number;
  texto: string;
  tom: Tom;
}

interface ToastContexto {
  avisar: (texto: string, tom?: Tom) => void;
}

const Contexto = createContext<ToastContexto | null>(null);

/** Avisos curtos de sucesso e falha. Implementação local, sem biblioteca. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const avisar = useCallback((texto: string, tom: Tom = "sucesso") => {
    const id = Date.now() + Math.random();
    setAvisos((atuais) => [...atuais, { id, texto, tom }]);
    window.setTimeout(() => {
      setAvisos((atuais) => atuais.filter((a) => a.id !== id));
    }, 4000);
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role={aviso.tom === "erro" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto max-w-80 border px-4 py-3 text-xs",
              aviso.tom === "erro"
                ? "border-error bg-surface-raised text-error"
                : "border-success bg-surface-raised text-success",
            )}
          >
            {aviso.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error("useToast precisa estar dentro de ToastProvider.");
  }
  return ctx;
}
