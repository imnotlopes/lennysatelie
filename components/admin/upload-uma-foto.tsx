"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { estilosBotao } from "@/components/ui";
import { comprimirImagem, tamanhoLegivel } from "@/lib/admin/comprimir-imagem";
import { urlDaMidia } from "@/lib/images";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface UploadUmaFotoProps {
  /** Caminho já salvo, ou vazio. */
  valor: string;
  aoMudar: (caminho: string) => void;
  aoAvisar: (texto: string, tom?: "sucesso" | "erro") => void;
  /** Proporção do quadro de prévia, para bater com o lugar de destino. */
  proporcao?: "retrato" | "story";
  className?: string;
}

/**
 * Envio de uma imagem só.
 *
 * Irmão menor do `UploadFotos`, que cuida da lista ordenada de fotos da peça.
 * Aqui cada linha tem uma imagem, então lista e reordenação só atrapalhariam.
 *
 * Reaproveita a mesma compressão do outro: a foto sai do celular com 4MB e
 * chega ao bucket com algumas centenas de KB, sem a dona precisar saber o que
 * é redimensionar.
 *
 * Grava em `site/` e não em `produtos/` para as imagens do site não se
 * misturarem com as do acervo na hora de olhar o bucket.
 */
export function UploadUmaFoto({
  valor,
  aoMudar,
  aoAvisar,
  proporcao = "retrato",
  className,
}: UploadUmaFotoProps) {
  const [enviando, setEnviando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  async function enviar(arquivo: File) {
    if (!arquivo.type.startsWith("image/")) {
      aoAvisar("Escolha um arquivo de imagem (JPG, PNG ou WEBP).", "erro");
      return;
    }

    setEnviando(true);
    try {
      const comprimida = await comprimirImagem(arquivo);
      const caminho = `site/${crypto.randomUUID()}.webp`;

      const supabase = createClient();
      const { error } = await supabase.storage
        .from("produtos")
        .upload(caminho, comprimida.arquivo, {
          contentType: "image/webp",
          upsert: false,
        });

      URL.revokeObjectURL(comprimida.previewUrl);

      if (error) {
        aoAvisar("Não foi possível enviar a imagem.", "erro");
      } else {
        aoMudar(caminho);
        aoAvisar(
          `Imagem enviada: ${tamanhoLegivel(comprimida.bytesOriginais)} viraram ${tamanhoLegivel(comprimida.bytesFinais)}.`,
        );
      }
    } catch (erro) {
      aoAvisar(
        erro instanceof Error ? erro.message : "Falha ao preparar a imagem.",
        "erro",
      );
    } finally {
      setEnviando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden border border-line bg-surface-alt",
          proporcao === "story" ? "aspect-9/16" : "aspect-product",
        )}
      >
        {valor ? (
          <Image
            src={urlDaMidia(valor)}
            alt=""
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-2xs text-ink-muted">
            Sem imagem
          </span>
        )}
      </div>

      <input
        ref={entrada}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) void enviar(arquivo);
        }}
      />

      <button
        type="button"
        disabled={enviando}
        onClick={() => entrada.current?.click()}
        className={estilosBotao({
          variant: "outline",
          size: "sm",
          className: "w-full disabled:opacity-50",
        })}
      >
        {enviando ? "Enviando" : valor ? "Trocar imagem" : "Escolher imagem"}
      </button>
    </div>
  );
}
