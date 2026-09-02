import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navegacao } from "@/components/admin/navegacao";
import { ToastProvider } from "@/components/admin/toast";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Painel | Lennys Ateliê",
  robots: { index: false, follow: false },
};

/**
 * Casca do painel: navegação e conteúdo, sem nada do site público.
 *
 * A rota /admin/login precisa renderizar sem navegação, e é a única de /admin
 * que pode ser vista sem sessão. Como o middleware já barra o resto, aqui
 * basta não desenhá-la quando não houver usuário.
 *
 * Denso de propósito: é uma ferramenta de uso repetido, não uma vitrine.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-1 flex-col lg:flex-row">
        <Navegacao usuario={user.email ?? "conta do ateliê"} />
        {/* O respiro embaixo é a altura da barra fixa do celular. Sem ele o
            último botão de cada tela fica escondido atrás dela. */}
        <div className="min-w-0 flex-1 pb-18 lg:pb-0">{children}</div>
      </div>
    </ToastProvider>
  );
}
