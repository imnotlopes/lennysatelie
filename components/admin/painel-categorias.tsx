"use client";

import { useState, useTransition } from "react";
import {
  excluirCategoria,
  reordenarCategorias,
  salvarCategoria,
  type DadosCategoria,
} from "@/app/actions/admin-geral";
import { useToast } from "@/components/admin/toast";
import { UploadUmaFoto } from "@/components/admin/upload-uma-foto";
import { Button, Input, estilosBotao } from "@/components/ui";
import type { CategoriaComTotal } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";

const VAZIA: DadosCategoria = {
  nome: "",
  slug: "",
  imagemCapa: "",
  imagemHero: "",
  ordem: 0,
};

export function PainelCategorias({
  categorias,
}: {
  categorias: CategoriaComTotal[];
}) {
  const { avisar } = useToast();
  const [lista, setLista] = useState(categorias);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<DadosCategoria>(VAZIA);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [salvando, iniciar] = useTransition();

  function abrirNova() {
    setEditando("nova");
    setForm({ ...VAZIA, ordem: lista.length + 1 });
  }

  function abrirEdicao(c: CategoriaComTotal) {
    setEditando(c.id);
    setForm({
      nome: c.nome,
      slug: c.slug,
      imagemCapa: c.imagem_capa ?? "",
      imagemHero: c.imagem_hero ?? "",
      ordem: c.ordem,
    });
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await salvarCategoria(
        editando === "nova" ? null : editando,
        form,
      );
      if (r.ok) {
        avisar("Categoria salva.");
        setEditando(null);
      } else {
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
      }
    });
  }

  function mover(de: number, para: number) {
    if (para < 0 || para >= lista.length) return;
    const copia = [...lista];
    const [item] = copia.splice(de, 1);
    copia.splice(para, 0, item);
    setLista(copia);
    iniciar(async () => {
      const r = await reordenarCategorias(copia.map((c) => c.id));
      if (!r.ok) {
        setLista(categorias);
        avisar(r.erro ?? "Não foi possível salvar a ordem.", "erro");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto border border-line bg-surface-raised">
        <table className="w-full min-w-160 text-left">
          <thead>
            <tr className="border-b border-line">
              {[
                "Ordem",
                "Nome",
                "Endereço",
                "Capa",
                "Topo",
                "Vestidos",
                "",
              ].map((t) => (
                <th
                  key={t}
                  scope="col"
                  className="p-3 text-2xs tracking-caps uppercase text-ink-muted"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((c, i) => (
              <tr
                key={c.id}
                draggable
                onDragStart={() => setArrastando(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (arrastando !== null) mover(arrastando, i);
                  setArrastando(null);
                }}
                className={cn(
                  "border-b border-line last:border-0",
                  arrastando === i && "opacity-50",
                  salvando && "opacity-60",
                )}
              >
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <BotaoSeta
                      rotulo={`Subir ${c.nome}`}
                      simbolo="↑"
                      desabilitado={i === 0}
                      aoClicar={() => mover(i, i - 1)}
                    />
                    <BotaoSeta
                      rotulo={`Descer ${c.nome}`}
                      simbolo="↓"
                      desabilitado={i === lista.length - 1}
                      aoClicar={() => mover(i, i + 1)}
                    />
                  </div>
                </td>
                <td className="p-3 text-xs text-ink">{c.nome}</td>
                <td className="p-3 text-xs text-ink-muted">{c.slug}</td>
                <td className="p-3 text-xs text-ink-muted">
                  {c.imagem_capa ? "sim" : "—"}
                </td>
                <td className="p-3 text-xs text-ink-muted">
                  {c.imagem_hero ? "sim" : "usa a capa"}
                </td>
                <td className="p-3 text-xs text-ink">{c.totalProdutos}</td>
                <td className="p-3">
                  <div className="flex gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(c)}
                      className="text-2xs tracking-caps uppercase text-ink underline underline-offset-4 hover:text-accent-ink"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        iniciar(async () => {
                          const r = await excluirCategoria(c.id);
                          if (r.ok) {
                            avisar(`${c.nome} foi excluída.`);
                            setLista((l) => l.filter((x) => x.id !== c.id));
                          } else {
                            avisar(
                              r.erro ?? "Não foi possível excluir.",
                              "erro",
                            );
                          }
                        })
                      }
                      className="text-2xs tracking-caps uppercase text-ink-muted underline underline-offset-4 hover:text-error"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-2xs text-ink-muted">
        Arraste a linha ou use as setas para mudar a ordem. É nessa ordem que as
        categorias aparecem na página inicial e nos filtros.
      </p>

      {editando ? (
        <form
          onSubmit={salvar}
          className="flex max-w-140 flex-col gap-4 border border-line bg-surface-raised p-5"
        >
          <h2 className="text-xs font-bold tracking-default text-ink">
            {editando === "nova" ? "Nova categoria" : "Editar categoria"}
          </h2>

          <Input
            id="cat-nome"
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
          />
          <Input
            id="cat-slug"
            label="Endereço da página"
            hint="Deixe em branco para gerarmos a partir do nome."
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          {/* Eram campos de texto pedindo "o caminho do arquivo no
              armazenamento". A Lennys não tem como saber o que é isso, e o
              acordo do projeto é zero jargão aqui dentro. Agora ela escolhe a
              foto do celular e vê a prévia. */}
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-ink">Foto de capa</span>
              <UploadUmaFoto
                valor={form.imagemCapa}
                aoMudar={(caminho) => setForm({ ...form, imagemCapa: caminho })}
                aoAvisar={avisar}
                className="max-w-45"
              />
              <p className="max-w-45 text-2xs text-ink-muted">
                O cartão da coleção na página inicial. Escolha uma foto em pé.
              </p>
              {form.imagemCapa ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagemCapa: "" })}
                  className="self-start text-2xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
                >
                  Tirar a foto de capa
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-ink">Foto de topo</span>
              <UploadUmaFoto
                valor={form.imagemHero}
                aoMudar={(caminho) => setForm({ ...form, imagemHero: caminho })}
                aoAvisar={avisar}
                className="max-w-45"
              />
              <p className="max-w-45 text-2xs text-ink-muted">
                A faixa larga no alto da página da coleção. Escolha uma foto
                deitada. Vazia, entra a foto de capa no lugar.
              </p>
              {form.imagemHero ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagemHero: "" })}
                  className="self-start text-2xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
                >
                  Tirar a foto de topo
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
          Nova categoria
        </button>
      )}
    </div>
  );
}

function BotaoSeta({
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
