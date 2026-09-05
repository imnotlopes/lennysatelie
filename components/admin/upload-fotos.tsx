"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { estilosBotao } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import {
  comprimirImagem,
  tamanhoLegivel,
} from "@/lib/admin/comprimir-imagem";
import { imagensProduto } from "@/lib/images";
import { cn } from "@/lib/utils";

export interface UploadFotosProps {
  /** Caminhos já salvos no bucket, na ordem de exibição. */
  valor: string[];
  aoMudar: (caminhos: string[]) => void;
  aoAvisar: (texto: string, tom?: "sucesso" | "erro") => void;
}

interface Enviando {
  nome: string;
  progresso: number;
}

/**
 * Envio das fotos da peça.
 *
 * A primeira da lista é a capa — é ela que aparece na grade e no
 * compartilhamento. Reordenar troca a capa, e é por isso que a ordem importa
 * e fica visível.
 *
 * Reordenação por arrastar E por botões: arrastar não funciona com teclado nem
 * com leitor de tela, então os botões não são redundância, são o caminho
 * acessível.
 */
export function UploadFotos({ valor, aoMudar, aoAvisar }: UploadFotosProps) {
  const [enviando, setEnviando] = useState<Enviando[]>([]);
  const [sobreArea, setSobreArea] = useState(false);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urls = imagensProduto(valor);

  const enviar = useCallback(
    async (arquivos: File[]) => {
      const imagens = arquivos.filter((a) => a.type.startsWith("image/"));
      if (!imagens.length) {
        aoAvisar("Escolha arquivos de imagem (JPG, PNG ou WEBP).", "erro");
        return;
      }

      setEnviando(imagens.map((a) => ({ nome: a.name, progresso: 0 })));
      const supabase = createClient();
      const novos: string[] = [];

      for (const [indice, arquivo] of imagens.entries()) {
        try {
          const comprimida = await comprimirImagem(arquivo);
          setEnviando((atual) =>
            atual.map((e, i) => (i === indice ? { ...e, progresso: 50 } : e)),
          );

          // Extensão e tipo do que foi realmente gerado — ver a nota em
          // `upload-uma-foto.tsx`.
          const caminho = `produtos/${crypto.randomUUID()}.${comprimida.formato}`;
          const { error } = await supabase.storage
            .from("produtos")
            .upload(caminho, comprimida.arquivo, {
              contentType: comprimida.arquivo.type,
              upsert: false,
            });

          URL.revokeObjectURL(comprimida.previewUrl);

          if (error) {
            aoAvisar(`Não foi possível enviar "${arquivo.name}".`, "erro");
          } else {
            novos.push(caminho);
            aoAvisar(
              `${arquivo.name}: ${tamanhoLegivel(comprimida.bytesOriginais)} viraram ${tamanhoLegivel(comprimida.bytesFinais)}.`,
            );
          }
        } catch (erro) {
          aoAvisar(
            erro instanceof Error ? erro.message : "Falha ao preparar a foto.",
            "erro",
          );
        }

        setEnviando((atual) =>
          atual.map((e, i) => (i === indice ? { ...e, progresso: 100 } : e)),
        );
      }

      setEnviando([]);
      if (novos.length) aoMudar([...valor, ...novos]);
    },
    [valor, aoMudar, aoAvisar],
  );

  function mover(de: number, para: number) {
    if (para < 0 || para >= valor.length) return;
    const copia = [...valor];
    const [item] = copia.splice(de, 1);
    copia.splice(para, 0, item);
    aoMudar(copia);
  }

  function remover(indice: number) {
    // Só sai da lista da peça. O arquivo continua no bucket até a peça ser
    // excluída — apagar aqui deixaria a foto sumida se ela desistir e sair
    // sem salvar.
    aoMudar(valor.filter((_, i) => i !== indice));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSobreArea(true);
        }}
        onDragLeave={() => setSobreArea(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSobreArea(false);
          void enviar([...e.dataTransfer.files]);
        }}
        className={cn(
          "flex flex-col items-center gap-2 border border-dashed p-6 text-center",
          "transition-colors duration-200 ease-brand",
          sobreArea ? "border-accent-ink bg-surface-alt" : "border-line-strong",
        )}
      >
        <p className="text-xs text-ink">
          Arraste as fotos para cá, ou escolha do computador.
        </p>
        <p className="text-2xs text-ink-muted">
          Pode soltar várias de uma vez. Reduzimos o tamanho automaticamente.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={estilosBotao({ variant: "outline", className: "mt-1" })}
        >
          Escolher fotos
        </button>

        {/* Escondido: quem aciona e o botao acima. Fica fora da ordem de
            tabulacao para o teclado nao parar num controle invisivel, mas
            mantem nome acessivel caso um leitor de tela chegue nele. */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          tabIndex={-1}
          aria-label="Escolher fotos do computador"
          className="sr-only"
          onChange={(e) => {
            void enviar([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </div>

      {enviando.length ? (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {enviando.map((e) => (
            <li key={e.nome} className="flex flex-col gap-1">
              <span className="text-2xs text-ink-muted">
                Enviando {e.nome}
              </span>
              <div className="h-1 w-full bg-surface-alt">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-soft"
                  style={{ width: `${e.progresso}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {valor.length ? (
        <>
          <p className="text-2xs text-ink-muted">
            A primeira foto é a capa. Arraste para trocar a ordem, ou use as
            setas.
          </p>

          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {valor.map((caminho, i) => (
              <li
                key={caminho}
                draggable
                onDragStart={() => setArrastando(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastando !== null) mover(arrastando, i);
                  setArrastando(null);
                }}
                className={cn(
                  "flex flex-col gap-1",
                  arrastando === i && "opacity-50",
                )}
              >
                <div className="relative aspect-product w-full overflow-hidden border border-line bg-surface-alt">
                  <Image
                    src={urls[i]}
                    alt={`Foto ${i + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  {i === 0 ? (
                    <span className="absolute top-0 left-0 bg-accent px-2 py-0.5 text-2xs tracking-caps uppercase text-ink">
                      Capa
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <BotaoMover
                      rotulo={`Mover foto ${i + 1} para trás`}
                      simbolo="←"
                      desabilitado={i === 0}
                      aoClicar={() => mover(i, i - 1)}
                    />
                    <BotaoMover
                      rotulo={`Mover foto ${i + 1} para frente`}
                      simbolo="→"
                      desabilitado={i === valor.length - 1}
                      aoClicar={() => mover(i, i + 1)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remover(i)}
                    className="text-2xs tracking-caps uppercase text-ink-muted underline underline-offset-2 hover:text-error"
                  >
                    Tirar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-2xs text-ink-muted">
          Sem foto, o vestido aparece com uma imagem cinza no site.
        </p>
      )}
    </div>
  );
}

function BotaoMover({
  rotulo,
  simbolo,
  desabilitado,
  aoClicar,
}: {
  rotulo: string;
  simbolo: string;
  desabilitado: boolean;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button"
      disabled={desabilitado}
      onClick={aoClicar}
      className="flex size-5 items-center justify-center border border-line-strong text-2xs text-ink transition-colors hover:border-accent-ink disabled:opacity-30"
    >
      <span aria-hidden="true">{simbolo}</span>
      <span className="sr-only">{rotulo}</span>
    </button>
  );
}
