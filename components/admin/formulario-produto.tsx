"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { criarProduto, atualizarProduto } from "@/app/actions/admin-produtos";
import { useToast } from "@/components/admin/toast";
import { UploadFotos } from "@/components/admin/upload-fotos";
import { Button, Input, Textarea } from "@/components/ui";
import {
  centavosParaTexto,
  gerarSlug,
  produtoSchema,
  TAMANHOS_DISPONIVEIS,
  textoParaCentavos,
  type ProdutoFormulario,
} from "@/lib/admin/produto-schema";
import type { Categoria } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface FormularioProdutoProps {
  categorias: Categoria[];
  /** Cores já cadastradas, para sugerir em vez de digitar de novo. */
  coresExistentes: string[];
  /** Ausente no cadastro de peça nova. */
  produtoId?: string;
  valoresIniciais: ProdutoFormulario;
}

export function FormularioProduto({
  categorias,
  coresExistentes,
  produtoId,
  valoresIniciais,
}: FormularioProdutoProps) {
  const router = useRouter();
  const { avisar } = useToast();
  const [salvando, iniciar] = useTransition();
  const [slugTravado, setSlugTravado] = useState(Boolean(produtoId));

  const form = useForm<ProdutoFormulario>({
    resolver: zodResolver(produtoSchema),
    defaultValues: valoresIniciais,
    mode: "onBlur",
  });

  const { register, handleSubmit, watch, setValue, formState } = form;
  const erros = formState.errors;
  const imagens = watch("imagens");
  const tamanhos = watch("tamanhos");

  function aoSalvar(dados: ProdutoFormulario) {
    iniciar(async () => {
      const r = produtoId
        ? await atualizarProduto(produtoId, dados)
        : await criarProduto(dados);

      if (!r.ok) {
        avisar(r.erro ?? "Não foi possível salvar.", "erro");
        return;
      }

      avisar(
        produtoId ? "Alterações salvas." : `${dados.nome} foi cadastrado.`,
      );

      if (!produtoId && r.id) {
        // Vai para a edição: quem acabou de cadastrar normalmente quer
        // conferir ou acrescentar mais uma foto.
        router.push(`/admin/produtos/${r.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(aoSalvar)}
      className="flex max-w-200 flex-col gap-8"
    >
      <Secao titulo="Identificação">
        <Input
          id="nome"
          label="Nome do vestido"
          error={erros.nome?.message}
          {...register("nome", {
            onChange: (e) => {
              if (!slugTravado) {
                setValue("slug", gerarSlug(e.target.value));
              }
            },
          })}
        />

        <Input
          id="slug"
          label="Endereço da página"
          hint="É o que aparece no link. Preenchemos a partir do nome; mude só se precisar."
          error={erros.slug?.message}
          {...register("slug", { onChange: () => setSlugTravado(true) })}
        />

        <Textarea
          id="descricao"
          label="Descrição"
          hint="Pode deixar em branco. Conte o tecido, o caimento e para que ocasião serve."
          rows={4}
          error={erros.descricao?.message}
          {...register("descricao")}
        />
      </Secao>

      <Secao titulo="Preço">
        <CampoMoeda
          id="preco"
          label="Valor da locação"
          hint="Deixe em branco para aparecer como 'Sob consulta'."
          valor={watch("precoCentavos")}
          aoMudar={(c) => setValue("precoCentavos", c, { shouldValidate: true })}
          erro={erros.precoCentavos?.message}
        />

        <CampoMoeda
          id="precoOriginal"
          label="Valor antigo, se estiver em promoção"
          hint="Aparece riscado ao lado. Deixe em branco se não houver promoção."
          valor={watch("precoOriginalCentavos") ?? null}
          aoMudar={(c) =>
            setValue("precoOriginalCentavos", c, { shouldValidate: true })
          }
          erro={erros.precoOriginalCentavos?.message}
        />
      </Secao>

      <Secao titulo="Características">
        <div className="flex flex-col gap-1">
          <label htmlFor="categoria" className="text-xs text-ink">
            Categoria
          </label>
          <select
            id="categoria"
            {...register("categoriaId")}
            className="h-9 w-full cursor-pointer rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Escolha uma categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {erros.categoriaId ? (
            <p className="text-2xs text-error" role="alert">
              {erros.categoriaId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cor" className="text-xs text-ink">
            Cor
          </label>
          <input
            id="cor"
            list="cores-existentes"
            {...register("cor")}
            placeholder="Pode deixar em branco"
            className="h-9 w-full rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink focus:border-ink focus:outline-none"
          />
          <datalist id="cores-existentes">
            {coresExistentes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <p className="text-2xs text-ink-muted">
            Escreva ou escolha uma que já existe. É por ela que a cliente
            filtra no site.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs text-ink">Tamanhos disponíveis</legend>
          <div className="flex flex-wrap gap-2">
            {TAMANHOS_DISPONIVEIS.map((t) => {
              const marcado = tamanhos.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={marcado}
                  onClick={() =>
                    setValue(
                      "tamanhos",
                      marcado
                        ? tamanhos.filter((x) => x !== t)
                        : [...tamanhos, t],
                      { shouldValidate: true },
                    )
                  }
                  className={cn(
                    "flex size-9 items-center justify-center border text-xs transition-colors duration-200 ease-brand",
                    marcado
                      ? "border-ink bg-ink text-ink-inverse"
                      : "border-line-strong text-ink hover:border-accent-ink",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <p className="text-2xs text-ink-muted">
            Sem nenhum tamanho marcado, a peça não aparece quando a cliente
            filtra por tamanho.
          </p>
        </fieldset>
      </Secao>

      <Secao titulo="Fotos">
        <UploadFotos
          valor={imagens}
          aoMudar={(caminhos) =>
            setValue("imagens", caminhos, { shouldDirty: true })
          }
          aoAvisar={avisar}
        />
      </Secao>

      <Secao titulo="Onde aparece">
        <Chave
          rotulo="Mostrar no site"
          explicacao="Desligado, o vestido fica guardado aqui no painel e ninguém vê."
          ligado={watch("ativo")}
          aoMudar={(v) => setValue("ativo", v, { shouldDirty: true })}
        />
        <Chave
          rotulo="Destacar na página inicial"
          explicacao="Ligado, entra no carrossel 'Queridinhos do momento'."
          ligado={watch("destaque")}
          aoMudar={(v) => setValue("destaque", v, { shouldDirty: true })}
        />
      </Secao>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" loading={salvando}>
          {produtoId ? "Salvar alterações" : "Cadastrar vestido"}
        </Button>
        <Link
          href="/admin/produtos"
          className="text-xs text-ink-muted underline underline-offset-4 hover:text-accent-ink"
        >
          Voltar sem salvar
        </Link>
      </div>
    </form>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6 first:border-0 first:pt-0">
      <h2 className="text-xs font-bold tracking-default text-ink">{titulo}</h2>
      {children}
    </section>
  );
}

/** Campo de dinheiro: mostra formatado e guarda em centavos. */
function CampoMoeda({
  id,
  label,
  hint,
  valor,
  aoMudar,
  erro,
}: {
  id: string;
  label: string;
  hint: string;
  valor: number | null;
  aoMudar: (centavos: number | null) => void;
  erro?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        value={centavosParaTexto(valor)}
        onChange={(e) => aoMudar(textoParaCentavos(e.target.value))}
        placeholder="R$ 0,00"
        className="h-9 w-full rounded-none border border-line-strong bg-surface-raised px-3 text-xs text-ink focus:border-ink focus:outline-none"
      />
      {erro ? (
        <p className="text-2xs text-error" role="alert">
          {erro}
        </p>
      ) : (
        <p className="text-2xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

function Chave({
  rotulo,
  explicacao,
  ligado,
  aoMudar,
}: {
  rotulo: string;
  explicacao: string;
  ligado: boolean;
  aoMudar: (valor: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={ligado}
        onClick={() => aoMudar(!ligado)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ease-brand",
          ligado ? "border-accent bg-accent" : "border-line-strong bg-surface-alt",
        )}
      >
        <span className="sr-only">{rotulo}</span>
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0.5 size-3.5 rounded-full bg-surface-raised transition-all duration-200 ease-brand",
            ligado ? "left-4.5" : "left-0.5",
          )}
        />
      </button>
      <div className="flex flex-col">
        <span className="text-xs text-ink">{rotulo}</span>
        <span className="text-2xs text-ink-muted">{explicacao}</span>
      </div>
    </div>
  );
}
