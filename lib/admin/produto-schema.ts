import { z } from "zod";

/**
 * Validação do cadastro de peça.
 *
 * As mensagens dizem o que fazer, não o que está errado — quem vai ler é a
 * dona do ateliê, não uma pessoa técnica. "Escolha uma categoria" em vez de
 * "categoria_id inválido".
 */

/** Gera o slug a partir do nome. Editável no formulário. */
export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const TAMANHOS_DISPONIVEIS = ["PP", "P", "M", "G", "GG", "XG"] as const;

export const produtoSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Escreva o nome do vestido.")
      .max(120, "Nome muito longo. Use até 120 caracteres."),

    slug: z
      .string()
      .trim()
      .min(2, "O endereço da página não pode ficar vazio.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use apenas letras minúsculas, números e hífen. Sem acento e sem espaço.",
      ),

    descricao: z.string().trim().max(2000, "Descrição muito longa.").optional(),

    /** Em centavos no formulário, para a máscara de moeda não perder precisão. */
    precoCentavos: z
      .number()
      .int()
      .min(0, "O preço não pode ser negativo.")
      .max(100_000_00, "Confira o preço: esse valor parece alto demais.")
      .nullable(),

    precoOriginalCentavos: z
      .number()
      .int()
      .min(0)
      .max(100_000_00)
      .nullable()
      .optional(),

    categoriaId: z.string().uuid("Escolha uma categoria.").nullable(),

    cor: z.string().trim().max(60).optional(),
    // 18 e o que cabe no canto da foto sem quebrar linha. A mesma trava esta
    // no banco, mas aqui a mensagem e legivel para quem esta digitando.
    etiqueta: z
      .string()
      .trim()
      .max(18, "A etiqueta precisa caber no canto da foto: até 18 letras.")
      .optional(),

    // Sem `.default()`: ele faria o tipo de entrada divergir do de saida, e o
    // resolver do react-hook-form exige os dois iguais. O formulario sempre
    // envia os dois campos.
    tamanhos: z.array(z.string()),

    imagens: z.array(z.string()),

    ativo: z.boolean(),
    destaque: z.boolean(),
  })
  .refine(
    (d) =>
      d.precoOriginalCentavos == null ||
      d.precoCentavos == null ||
      d.precoOriginalCentavos > d.precoCentavos,
    {
      path: ["precoOriginalCentavos"],
      message:
        "O preço antigo precisa ser maior que o preço atual, senão não é promoção.",
    },
  );

export type ProdutoFormulario = z.infer<typeof produtoSchema>;

/* -------------------------------------------------------------------------- */
/* Moeda                                                                      */
/* -------------------------------------------------------------------------- */

/** "R$ 1.234,50" a partir de 123450. */
export function centavosParaTexto(centavos: number | null): string {
  if (centavos === null) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

/**
 * Lê o que a pessoa digitou e devolve centavos.
 *
 * Aceita qualquer coisa: "380", "R$ 380,00", "380,50". Só os dígitos contam,
 * e os dois últimos são os centavos — é o comportamento de máscara que quem
 * digita valor o dia inteiro espera.
 */
export function textoParaCentavos(texto: string): number | null {
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return null;
  return Number.parseInt(digitos, 10);
}

/** Converte para o que o banco guarda: reais com duas casas. */
export function centavosParaReais(centavos: number | null): number | null {
  return centavos === null ? null : centavos / 100;
}

export function reaisParaCentavos(reais: number | null): number | null {
  return reais === null ? null : Math.round(reais * 100);
}
