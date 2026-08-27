/**
 * Tipos do banco.
 *
 * Escritos à mão para espelhar `supabase/migrations/001_schema.sql`.
 *
 * Para regerar a partir do banco real, use o comando da seção "Regerar os
 * tipos" em `supabase/README.md` — ele tem duas precauções necessárias no
 * Windows que a forma ingênua não tem.
 *
 * Se mexer no schema, mexa aqui junto.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TipoDesconto = "percentual" | "fixo";

export type TipoEvento =
  | "visita_produto"
  | "cupom_aplicado"
  | "clique_whatsapp";

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          imagem_capa: string | null;
          ordem: number;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          imagem_capa?: string | null;
          ordem?: number;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          imagem_capa?: string | null;
          ordem?: number;
        };
        Relationships: [];
      };

      produtos: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          preco_locacao: number | null;
          preco_original: number | null;
          tamanho: string[];
          cor: string | null;
          categoria_id: string | null;
          imagens: string[];
          destaque: boolean;
          ativo: boolean;
          ordem: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
          preco_locacao?: number | null;
          preco_original?: number | null;
          tamanho?: string[];
          cor?: string | null;
          categoria_id?: string | null;
          imagens?: string[];
          destaque?: boolean;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          descricao?: string | null;
          preco_locacao?: number | null;
          preco_original?: number | null;
          tamanho?: string[];
          cor?: string | null;
          categoria_id?: string | null;
          imagens?: string[];
          destaque?: boolean;
          ativo?: boolean;
          ordem?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
        ];
      };

      cupons: {
        Row: {
          id: string;
          codigo: string;
          influenciadora_nome: string | null;
          influenciadora_instagram: string | null;
          tipo_desconto: TipoDesconto;
          valor: number;
          ativo: boolean;
          inicio: string | null;
          validade: string | null;
          limite_usos: number | null;
          usos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          influenciadora_nome?: string | null;
          influenciadora_instagram?: string | null;
          tipo_desconto: TipoDesconto;
          valor?: number;
          ativo?: boolean;
          inicio?: string | null;
          validade?: string | null;
          limite_usos?: number | null;
          usos?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          influenciadora_nome?: string | null;
          influenciadora_instagram?: string | null;
          tipo_desconto?: TipoDesconto;
          valor?: number;
          ativo?: boolean;
          inicio?: string | null;
          validade?: string | null;
          limite_usos?: number | null;
          usos?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      eventos: {
        Row: {
          id: string;
          tipo: TipoEvento;
          produto_id: string | null;
          cupom_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: TipoEvento;
          produto_id?: string | null;
          cupom_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipo?: TipoEvento;
          produto_id?: string | null;
          cupom_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eventos_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "eventos_cupom_id_fkey";
            columns: ["cupom_id"];
            isOneToOne: false;
            referencedRelation: "cupons";
            referencedColumns: ["id"];
          },
        ];
      };

      configuracoes: {
        Row: { chave: string; valor: Json };
        Insert: { chave: string; valor?: Json };
        Update: { chave?: string; valor?: Json };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

/* -------------------------------------------------------------------------- */
/* Atalhos usados pela aplicação                                              */
/* -------------------------------------------------------------------------- */

export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Produto = Database["public"]["Tables"]["produtos"]["Row"];
export type Cupom = Database["public"]["Tables"]["cupons"]["Row"];
export type Evento = Database["public"]["Tables"]["eventos"]["Row"];
export type Configuracao = Database["public"]["Tables"]["configuracoes"]["Row"];

/**
 * O que o público consegue ler de um cupom.
 *
 * `influenciadora_nome` entra porque o banner de cupom o exibe — e a
 * influenciadora divulga o código publicamente de qualquer forma. Já
 * `influenciadora_instagram` segue bloqueado pelo GRANT na migration.
 */
export type CupomPublico = Omit<
  Cupom,
  "influenciadora_instagram" | "created_at"
>;

/** Produto com a categoria já resolvida pelo join. */
export type ProdutoComCategoria = Produto & {
  categoria: Pick<Categoria, "id" | "nome" | "slug"> | null;
};
