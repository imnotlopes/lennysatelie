"use client";

import { useEffect, useState } from "react";
import { buscarProdutosVistos } from "@/app/actions/produto";
import { Carrossel } from "@/components/home/carrossel";
import { ProdutoCard } from "@/components/produto-card";
import { Heading } from "@/components/ui";
import { lerHistorico, registrarVisto } from "@/lib/historico";
import type { CupomPublico, ProdutoComCategoria } from "@/lib/supabase/types";

export interface VistosRecentementeProps {
  /** Peça da página atual: entra no histórico e sai da lista exibida. */
  slugAtual: string;
  cupom?: CupomPublico | null;
}

/**
 * "Vistos por você recentemente".
 *
 * Só existe no cliente, porque o histórico vive no navegador da visitante.
 * Enquanto ela não tiver visto outra peça, a seção não renderiza nada — é
 * melhor não existir do que aparecer vazia.
 *
 * Registra a peça atual depois de ler a lista, para a página que ela está
 * vendo agora não aparecer entre as "já vistas".
 */
export function VistosRecentemente({
  slugAtual,
  cupom,
}: VistosRecentementeProps) {
  const [produtos, setProdutos] = useState<ProdutoComCategoria[]>([]);

  useEffect(() => {
    const anteriores = lerHistorico().filter((s) => s !== slugAtual);
    registrarVisto(slugAtual);

    if (!anteriores.length) return;

    let ativo = true;
    void buscarProdutosVistos(anteriores).then((lista) => {
      if (ativo) setProdutos(lista);
    });

    return () => {
      ativo = false;
    };
  }, [slugAtual]);

  if (!produtos.length) return null;

  return (
    <section className="flex flex-col gap-6 border-t border-line pt-12">
      <Heading as={2} size="display-sm" revelar>
        Vistos por você recentemente
      </Heading>

      <Carrossel rotulo="Peças que você viu recentemente">
        {produtos.map((produto) => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            sizes="(min-width: 1025px) 25vw, 66vw"
            cupom={cupom}
          />
        ))}
      </Carrossel>
    </section>
  );
}
