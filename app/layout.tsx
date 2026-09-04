import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Karla, Marcellus } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Marcellus no lugar da Cormorant Garamond: a Cormorant servida pelo
// next/font posiciona mal os diacriticos do portugues — o circunflexo de
// "Atelie" sai solto, a direita da letra. Verificado duas vezes.
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lenny's Ateliê",
  description: "Locação de vestidos de festa.",
};

/**
 * Layout raiz: só html, body e fontes.
 *
 * O site público e o painel têm cascas diferentes, então cada um traz a sua
 * — `app/(site)/layout.tsx` e `app/admin/layout.tsx`. Sem essa separação, o
 * painel herdaria header, rodapé e botão de WhatsApp do site.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${karla.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
