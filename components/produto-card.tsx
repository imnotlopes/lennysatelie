import Image from "next/image";
import Link from "next/link";
import { Preco } from "@/components/ui";
import {
  BLUR_DATA_URL,
  imagemProduto,
  imagemProdutoSecundaria,
} from "@/lib/images";
import type { CupomPublico, ProdutoComCategoria } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface ProdutoCardProps {
  produto: ProdutoComCategoria;
  /** Repassa o `sizes` do contexto, para o Next escolher a resolução certa. */
  sizes: string;
  /** Carrega sem lazy. Use nas primeiras peças acima da dobra. */
  prioridade?: boolean;
  /** Cupom ativo, para o preço já sair com desconto. */
  cupom?: CupomPublico | null;
  className?: string;
}

/**
 * Card de produto: foto, nome e preço. Nada mais.
 *
 * No formato da referência que o Edson trouxe: texto centrado embaixo da foto,
 * nome em caixa alta com espaçamento largo, preço logo abaixo. Saiu a linha da
 * categoria — quem está no acervo filtrado por "Festa" não precisa ler "Festa"
 * em cinquenta cards.
 *
 * Sem borda, sem fundo e sem sombra: a foto encosta na vizinha e o texto fica
 * solto sobre o creme da página.
 *
 * A etiqueta, quando existe, fica no canto superior esquerdo da foto. É a dona
 * quem escreve pelo painel.
 */
export function ProdutoCard({
  produto,
  sizes,
  prioridade = false,
  cupom,
  className,
}: ProdutoCardProps) {
  const capa = imagemProduto(produto.imagens);
  const segunda = imagemProdutoSecundaria(produto.imagens);
  const etiqueta = produto.etiqueta?.trim();

  return (
    <Link
      href={`/acervo/${produto.slug}`}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div
        data-revelar="zoom"
        suppressHydrationWarning
        className="relative aspect-product w-full overflow-hidden bg-surface-alt"
      >
        <Image
          src={capa}
          alt={`Vestido ${produto.nome}`}
          fill
          sizes={sizes}
          priority={prioridade}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={cn(
            "object-cover transition-opacity duration-300 ease-brand",
            // Sem segunda foto, o hover se resolve num escurecimento leve.
            segunda || "group-hover:opacity-90",
          )}
        />

        {segunda ? (
          <Image
            src={segunda}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="card-foto-hover object-cover"
          />
        ) : null}

        {etiqueta ? (
          <span className="absolute top-0 left-0 z-10 bg-ink px-3 py-1.5 text-2xs tracking-caps uppercase text-ink-inverse">
            {etiqueta}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand group-hover:text-accent-ink">
          {produto.nome}
        </h3>
        <Preco produto={produto} cupom={cupom} className="justify-center" />
      </div>
    </Link>
  );
}
