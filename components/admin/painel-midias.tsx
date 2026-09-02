"use client";

import { useState, useTransition } from "react";
import {
  alternarMidiaAtiva,
  atualizarMidia,
  buscarCapaDoReel,
  criarMidia,
  excluirMidia,
  moverMidia,
  type DadosMidia,
} from "@/app/actions/admin-midias";
import { useToast } from "@/components/admin/toast";
import { UploadUmaFoto } from "@/components/admin/upload-uma-foto";
import { Button, Input, Textarea, estilosBotao } from "@/components/ui";
import type { Midia, TipoMidia } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface Aba {
  tipo: TipoMidia;
  rotulo: string;
  ondeAparece: string;
  explicacao: string;
  proporcao: "retrato" | "story";
  pedeTexto: boolean;
  pedeLink: boolean;
  /** Abaixo disto a seção fica capenga. Avisa, não impede. */
  minimo: number;
}

const ABAS: Aba[] = [
  {
    tipo: "hero",
    rotulo: "Topo da página inicial",
    ondeAparece: "A primeira coisa que a cliente vê ao abrir o site.",
    explicacao:
      "As fotos se revezam sozinhas, cada uma por 6 segundos. Use fotos em pé, de boa qualidade: elas aparecem em tela cheia.",
    proporcao: "retrato",
    pedeTexto: false,
    pedeLink: false,
    minimo: 1,
  },
  {
    tipo: "feedback_imagem",
    rotulo: "Clientes com o vestido",
    ondeAparece: 'Seção "Elas vestiram, elas contaram".',
    explicacao:
      "As artes do Instagram, com a foto da cliente e o recado dela na mesma imagem.",
    proporcao: "story",
    pedeTexto: true,
    pedeLink: false,
    minimo: 0,
  },
  {
    tipo: "feedback_mensagem",
    rotulo: "Prints de conversa",
    ondeAparece: 'Seção "O que elas dizem depois".',
    explicacao:
      "As capturas do WhatsApp. Recorte antes de subir para não aparecer telefone nem foto de perfil de ninguém.",
    proporcao: "retrato",
    pedeTexto: true,
    pedeLink: false,
    minimo: 0,
  },
  {
    tipo: "reel",
    rotulo: "Vídeos",
    ondeAparece: 'Seção "Veja em movimento".',
    explicacao:
      "Cole o link do vídeo no Instagram e a capa vem sozinha. O vídeo abre lá, não toca aqui.",
    proporcao: "story",
    pedeTexto: false,
    pedeLink: true,
    minimo: 0,
  },
];

const VAZIA = (tipo: TipoMidia): DadosMidia => ({
  tipo,
  arquivo: "",
  textoAlt: "",
  url: "",
  ativo: true,
});

export function PainelMidias({ midias }: { midias: Midia[] }) {
  const { avisar } = useToast();
  const [abaAtiva, setAbaAtiva] = useState<TipoMidia>("hero");
  const [editando, setEditando] = useState<string | "nova" | null>(null);
  const [form, setForm] = useState<DadosMidia>(VAZIA("hero"));
  const [salvando, iniciar] = useTransition();

  const aba = ABAS.find((a) => a.tipo === abaAtiva) as Aba;
  const daAba = midias.filter((m) => m.tipo === abaAtiva);
  const ativas = daAba.filter((m) => m.ativo).length;

  function abrirNova() {
    setForm(VAZIA(abaAtiva));
    setEditando("nova");
  }

  function abrirEdicao(m: Midia) {
    setForm({
      tipo: m.tipo,
      arquivo: m.arquivo,
      textoAlt: m.texto_alt ?? "",
      url: m.url ?? "",
      ativo: m.ativo,
    });
    setEditando(m.id);
  }

  function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    iniciar(async () => {
      const r =
        editando === "nova"
          ? await criarMidia(form)
          : await atualizarMidia(editando as string, form);

      if (!r.ok) {
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
        return;
      }
      avisar("Salvo. Já está no site.");
      setEditando(null);
    });
  }

  /** Cola o link, busca a capa e já preenche o campo da imagem. */
  function puxarCapa() {
    iniciar(async () => {
      const r = await buscarCapaDoReel(form.url);
      if (!r.ok || !r.capa) {
        avisar(r.erro ?? "Não foi possível buscar a capa.", "erro");
        return;
      }
      setForm((f) => ({ ...f, arquivo: r.capa as string }));
      avisar("Capa encontrada. Confira a prévia e salve.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-2 border-b border-line pb-3">
        {ABAS.map((a) => {
          const quantas = midias.filter(
            (m) => m.tipo === a.tipo && m.ativo,
          ).length;
          return (
            <button
              key={a.tipo}
              type="button"
              aria-current={abaAtiva === a.tipo ? "page" : undefined}
              onClick={() => {
                setAbaAtiva(a.tipo);
                setEditando(null);
              }}
              className={estilosBotao({
                variant: abaAtiva === a.tipo ? "primary" : "outline",
                size: "md",
              })}
            >
              {a.rotulo}
              <span className="text-2xs opacity-70">({quantas})</span>
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <p className="text-xs text-ink">{aba.ondeAparece}</p>
        <p className="max-w-prose text-2xs text-ink-muted">{aba.explicacao}</p>
      </div>

      {ativas < aba.minimo ? (
        <p
          role="alert"
          className="border border-error px-4 py-3 text-xs text-error"
        >
          Esta seção precisa de pelo menos {aba.minimo} imagem ligada, senão o
          topo do site fica vazio.
        </p>
      ) : null}

      {editando ? (
        <form
          onSubmit={salvar}
          className="flex flex-col gap-4 border border-line bg-surface-raised p-5"
        >
          <h2 className="text-xs font-bold tracking-default text-ink">
            {editando === "nova" ? "Nova imagem" : "Editando"}
          </h2>

          {aba.pedeLink ? (
            <div className="flex flex-col gap-2">
              <Input
                id="url"
                label="Link do vídeo no Instagram"
                hint="Abra o vídeo, copie o endereço da barra e cole aqui."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <button
                type="button"
                disabled={salvando || !form.url.trim()}
                onClick={puxarCapa}
                className={estilosBotao({
                  variant: "outline",
                  size: "md",
                  className: "self-start disabled:opacity-50",
                })}
              >
                {salvando ? "Buscando" : "Buscar a capa do vídeo"}
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-start gap-6">
            <UploadUmaFoto
              valor={form.arquivo}
              aoMudar={(caminho) => setForm({ ...form, arquivo: caminho })}
              aoAvisar={avisar}
              proporcao={aba.proporcao}
              className="w-40 shrink-0"
            />

            <div className="flex min-w-60 flex-1 flex-col gap-4">
              {aba.pedeTexto ? (
                <Textarea
                  id="texto-alt"
                  label="O que está escrito na imagem"
                  hint="Copie aqui o recado da cliente. É o que uma pessoa cega vai ouvir, e o que o Google lê."
                  rows={5}
                  value={form.textoAlt}
                  onChange={(e) =>
                    setForm({ ...form, textoAlt: e.target.value })
                  }
                />
              ) : null}

              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.ativo}
                  onClick={() => setForm({ ...form, ativo: !form.ativo })}
                  className={cn(
                    "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ease-brand",
                    form.ativo
                      ? "border-accent bg-accent"
                      : "border-line-strong bg-surface-alt",
                  )}
                >
                  <span className="sr-only">Aparecendo no site</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-0.5 size-3.5 rounded-full bg-surface-raised transition-all duration-200 ease-brand",
                      form.ativo ? "left-4.5" : "left-0.5",
                    )}
                  />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs text-ink">Aparecendo no site</span>
                  <span className="text-2xs text-ink-muted">
                    Desligado, some do site mas continua aqui.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <Button type="submit" loading={salvando}>
              Salvar
            </Button>
            <button
              type="button"
              onClick={() => setEditando(null)}
              className="text-xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={abrirNova}
          className={estilosBotao({ className: "self-start" })}
        >
          Adicionar imagem
        </button>
      )}

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {daAba.map((m, indice) => (
          <li
            key={m.id}
            className={cn(
              "flex flex-col gap-2 border border-line bg-surface-raised p-3",
              !m.ativo && "opacity-55",
            )}
          >
            <UploadUmaFoto
              valor={m.arquivo}
              aoMudar={() => {}}
              aoAvisar={avisar}
              proporcao={aba.proporcao}
              className="pointer-events-none"
            />

            {m.texto_alt ? (
              <p className="line-clamp-3 text-2xs leading-base text-ink-muted">
                {m.texto_alt}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-1">
              <BotaoMini
                rotulo="Subir"
                simbolo="↑"
                desabilitado={indice === 0 || salvando}
                aoClicar={() =>
                  iniciar(async () => {
                    await moverMidia(m.id, "sobe");
                  })
                }
              />
              <BotaoMini
                rotulo="Descer"
                simbolo="↓"
                desabilitado={indice === daAba.length - 1 || salvando}
                aoClicar={() =>
                  iniciar(async () => {
                    await moverMidia(m.id, "desce");
                  })
                }
              />
              <button
                type="button"
                onClick={() => abrirEdicao(m)}
                className="ml-auto text-2xs tracking-caps uppercase text-ink underline underline-offset-4 hover:text-accent-ink"
              >
                Editar
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-2xs text-ink-muted">
                <input
                  type="checkbox"
                  checked={m.ativo}
                  disabled={salvando}
                  onChange={(e) =>
                    iniciar(async () => {
                      await alternarMidiaAtiva(m.id, e.target.checked);
                    })
                  }
                  className="size-3.5 accent-[var(--color-accent)]"
                />
                No site
              </label>

              <button
                type="button"
                disabled={salvando}
                onClick={() => {
                  if (!confirm("Apagar esta imagem do site? Não tem volta.")) return;
                  iniciar(async () => {
                    const r = await excluirMidia(m.id);
                    avisar(r.ok ? "Apagada." : (r.erro ?? "Falhou."), r.ok ? "sucesso" : "erro");
                  });
                }}
                className="text-2xs tracking-caps uppercase text-error underline underline-offset-4 disabled:opacity-50"
              >
                Apagar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {daAba.length === 0 ? (
        <p className="text-xs text-ink-muted">
          Nenhuma imagem aqui ainda. A seção não aparece no site enquanto
          estiver vazia.
        </p>
      ) : null}
    </div>
  );
}

function BotaoMini({
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
      aria-label={rotulo}
      className="flex size-7 items-center justify-center border border-line-strong text-xs text-ink transition-colors duration-200 ease-brand hover:border-accent-ink disabled:opacity-35"
    >
      {simbolo}
    </button>
  );
}
