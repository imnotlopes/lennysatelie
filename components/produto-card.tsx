import Image from "next/image";
import Link from "next/link";
import { Preco } from "@/components/ui";
import { BLUR_DATA_URL, imagemProduto, imagemProdutoSecundaria } from "@/lib/images";
import type {
  CupomPublico,
  ProdutoComCategoria,
} from "@/lib/supabase/types";
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
 * Card de produto: foto 2:3, nome, categoria e preço.
 *
 * Sem borda, sem fundo e sem sombra, como na referência — a foto encosta na
 * vizinha e o texto fica solto sobre o creme da página.
 *
 * Quando a peça tem uma segunda foto, ela aparece no hover em telas com
 * ponteiro. Enquanto o acervo não tiver fotos reais, esse caminho fica
 * inerte, porque `imagens` está vazio.
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

  return (
    <Link
      href={`/acervo/${produto.slug}`}
      className={cn("group flex flex-col gap-2", className)}
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
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm leading-base tracking-default text-ink transition-colors duration-200 ease-brand group-hover:text-accent-ink">
          {produto.nome}
        </h3>
        {produto.categoria ? (
          <span className="text-2xs text-ink-muted">
            {produto.categoria.nome}
          </span>
        ) : null}
        <Preco produto={produto} cupom={cupom} />
      </div>
    </Link>
  );
}
