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
      // O script abaixo escreve `data-revelacao` aqui antes da hidratacao.
      // Sem isto o React acusa divergencia no proprio <html>.
      suppressHydrationWarning
      className={`${karla.variable} ${marcellus.variable} h-full antialiased`}
    >
      <head>
        {/*
          Liga as revelações. Sem esta marca, o CSS nem esconde as palavras: o
          título aparece normal, e o site funciona sem JavaScript nenhum.

          É um script embutido, e não um `useEffect`, porque precisa rodar
          antes da primeira pintura. Num efeito, o título apareceria, sumiria
          e voltaria — pior que não ter efeito.

          O tamanho é proposital: uma linha, sem dependência, sem espera.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              "document.documentElement.dataset.revelacao='ativa';",
              // Rede de seguranca. Se o observador nunca rodar — erro no pacote
              // do cliente, aba descartada pelo navegador — a marca cai e a
              // pagina aparece inteira, sem efeito. Sem isto, um titulo pode
              // ficar invisivel para sempre esperando alguem revela-lo.
              "setTimeout(function(){",
              "if(!document.querySelector('[data-visivel]'))",
              "delete document.documentElement.dataset.revelacao;",
              "},4000);",
            ].join(""),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
