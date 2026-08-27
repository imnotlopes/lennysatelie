import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Painel | Lennys Ateliê",
  robots: { index: false, follow: false },
};

/**
 * Casca do painel: sidebar e conteúdo, sem nada do site público.
 *
 * A rota /admin/login precisa renderizar sem sidebar, e é a única de /admin
 * que pode ser vista sem sessão. Como o middleware já barra o resto, aqui
 * basta não desenhar a sidebar quando não houver usuário.
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
        <Sidebar usuario={user.email ?? "conta do ateliê"} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ToastProvider>
  );
}
