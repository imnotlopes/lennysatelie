import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existe um package-lock.json no diretório do usuário que faz o Next inferir
  // a raiz do workspace errada. Fixamos na pasta do projeto.
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // SEM O OTIMIZADOR DA VERCEL, DE PROPOSITO
    // ----------------------------------------
    // Em 03/11/2026 o site ficou com fotos faltando: a Vercel passou a
    // responder 402 (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) porque a cota
    // mensal de otimizacao acabou. Quem ja estava no cache dela continuava
    // aparecendo; cada foto nova que a Lennys subia quebrava, porque exigia
    // uma otimizacao inedita. O defeito parecia aleatorio e nao era.
    //
    // Desligar resolve de vez: o arquivo sai direto do Storage do Supabase.
    // Da para fazer isso porque o painel ja entrega webp redimensionado no
    // upload, entao o otimizador tinha pouco a acrescentar. Medido no acervo
    // inteiro: 340 imagens, mediana de 133KB, 308 delas abaixo de 300KB.
    //
    // O que se perde: srcset por largura de tela. O celular baixa o mesmo
    // arquivo do desktop. Os `sizes` espalhados pelos componentes ficam sem
    // efeito e foram mantidos de proposito, para religar isto ser so apagar
    // a linha abaixo.
    //
    // O que muda de lugar: a banda das imagens sai da Vercel e vai para o
    // Supabase, que no plano gratuito da 5GB de saida por mes.
    unoptimized: true,

    // Fotos de produto e capa de categoria servidas pelo Storage do Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qfnbcdlrvhesdehjbudw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
