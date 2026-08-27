import type { Metadata } from "next";
import { FormularioLogin } from "@/components/admin/formulario-login";

export const metadata: Metadata = {
  title: "Entrar | Painel Lennys Ateliê",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-80 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-display-sm leading-tight text-ink">
            Painel do ateliê
          </h1>
          <p className="text-xs text-ink-muted">
            Entre para cuidar do acervo e ver os resultados do site.
          </p>
        </div>

        <FormularioLogin />
      </div>
    </main>
  );
}
