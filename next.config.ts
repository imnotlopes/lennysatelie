import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existe um package-lock.json no diretório do usuário que faz o Next inferir
  // a raiz do workspace errada. Fixamos na pasta do projeto.
  outputFileTracingRoot: path.join(__dirname),

  images: {
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
