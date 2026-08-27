-- ============================================================================
-- Lennys Ateliê — schema inicial
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, de uma vez.
-- É idempotente: pode rodar de novo sem quebrar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique,
  imagem_capa text,
  ordem       int  not null default 0
);

create table if not exists public.produtos (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  slug           text not null unique,
  descricao      text,
  preco_locacao  numeric(10, 2) not null default 0,
  tamanho        text[] not null default '{}',
  cor            text,
  categoria_id   uuid references public.categorias (id) on delete set null,
  imagens        text[] not null default '{}',
  destaque       boolean not null default false,
  ativo          boolean not null default true,
  ordem          int not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.cupons (
  id                       uuid primary key default gen_random_uuid(),
  codigo                   text not null unique,
  influenciadora_nome      text,
  influenciadora_instagram text,
  tipo_desconto            text not null check (tipo_desconto in ('percentual', 'fixo')),
  valor                    numeric(10, 2) not null default 0,
  ativo                    boolean not null default true,
  validade                 date,
  limite_usos              int,
  usos                     int not null default 0,
  created_at               timestamptz not null default now()
);

create table if not exists public.eventos (
  id         uuid primary key default gen_random_uuid(),
  tipo       text not null check (tipo in ('visita_produto', 'cupom_aplicado', 'clique_whatsapp')),
  produto_id uuid references public.produtos (id) on delete set null,
  cupom_id   uuid references public.cupons (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.configuracoes (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb
);

-- ----------------------------------------------------------------------------
-- Índices
-- ----------------------------------------------------------------------------

-- produtos.slug e cupons.codigo já ganham índice pela constraint unique.
create index if not exists idx_produtos_categoria_id on public.produtos (categoria_id);
create index if not exists idx_produtos_ativo        on public.produtos (ativo);
create index if not exists idx_produtos_destaque     on public.produtos (destaque) where destaque = true;
create index if not exists idx_eventos_tipo          on public.eventos (tipo);
create index if not exists idx_eventos_created_at    on public.eventos (created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- Regra geral: o público (anon) só lê o que está publicado. Qualquer escrita
-- exige sessão autenticada. A única exceção é `eventos`, que aceita insert
-- público porque é o que registra a visita de quem não tem conta.
-- ----------------------------------------------------------------------------

alter table public.categorias    enable row level security;
alter table public.produtos      enable row level security;
alter table public.cupons        enable row level security;
alter table public.eventos       enable row level security;
alter table public.configuracoes enable row level security;

-- ---- categorias ----
-- Nota: a especificação pedia "select público quando ativo = true" para
-- produtos e categorias, mas `categorias` não tem coluna `ativo`. Mantive as
-- colunas exatamente como especificadas e deixei a leitura pública sem
-- condição. Se quiser poder despublicar uma categoria, é adicionar
-- `ativo boolean not null default true` e trocar o `using (true)` abaixo.
drop policy if exists "categorias: leitura publica" on public.categorias;
create policy "categorias: leitura publica"
  on public.categorias for select
  to anon, authenticated
  using (true);

drop policy if exists "categorias: escrita autenticada" on public.categorias;
create policy "categorias: escrita autenticada"
  on public.categorias for all
  to authenticated
  using (true) with check (true);

-- ---- produtos ----
drop policy if exists "produtos: leitura publica dos ativos" on public.produtos;
create policy "produtos: leitura publica dos ativos"
  on public.produtos for select
  to anon
  using (ativo = true);

drop policy if exists "produtos: leitura total autenticada" on public.produtos;
create policy "produtos: leitura total autenticada"
  on public.produtos for select
  to authenticated
  using (true);

drop policy if exists "produtos: escrita autenticada" on public.produtos;
create policy "produtos: escrita autenticada"
  on public.produtos for all
  to authenticated
  using (true) with check (true);

-- ---- cupons ----
-- O público só enxerga cupom que está de fato valendo: ativo, dentro da
-- validade e abaixo do limite de usos. Cupom expirado ou esgotado simplesmente
-- não existe para quem não está logado.
drop policy if exists "cupons: leitura publica dos validos" on public.cupons;
create policy "cupons: leitura publica dos validos"
  on public.cupons for select
  to anon
  using (
    ativo = true
    and (validade is null or validade >= current_date)
    and (limite_usos is null or usos < limite_usos)
  );

drop policy if exists "cupons: leitura total autenticada" on public.cupons;
create policy "cupons: leitura total autenticada"
  on public.cupons for select
  to authenticated
  using (true);

drop policy if exists "cupons: escrita autenticada" on public.cupons;
create policy "cupons: escrita autenticada"
  on public.cupons for all
  to authenticated
  using (true) with check (true);

-- RLS filtra linha, não coluna. O nome e o Instagram da influenciadora são
-- dado de negócio e não podem vazar na validação do cupom, então restringimos
-- as colunas que o anon enxerga via GRANT.
revoke select on public.cupons from anon;
grant select (id, codigo, tipo_desconto, valor, ativo, validade, limite_usos, usos)
  on public.cupons to anon;

-- ---- eventos ----
drop policy if exists "eventos: insert publico" on public.eventos;
create policy "eventos: insert publico"
  on public.eventos for insert
  to anon, authenticated
  with check (true);

drop policy if exists "eventos: leitura autenticada" on public.eventos;
create policy "eventos: leitura autenticada"
  on public.eventos for select
  to authenticated
  using (true);

drop policy if exists "eventos: manutencao autenticada" on public.eventos;
create policy "eventos: manutencao autenticada"
  on public.eventos for delete
  to authenticated
  using (true);

-- ---- configuracoes ----
drop policy if exists "configuracoes: leitura publica" on public.configuracoes;
create policy "configuracoes: leitura publica"
  on public.configuracoes for select
  to anon, authenticated
  using (true);

drop policy if exists "configuracoes: escrita autenticada" on public.configuracoes;
create policy "configuracoes: escrita autenticada"
  on public.configuracoes for all
  to authenticated
  using (true) with check (true);

-- ----------------------------------------------------------------------------
-- Storage: bucket das fotos de produto
--
-- Público para leitura (as fotos aparecem no site sem login) e upload apenas
-- para quem está autenticado no painel.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "produtos bucket: leitura publica" on storage.objects;
create policy "produtos bucket: leitura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'produtos');

drop policy if exists "produtos bucket: upload autenticado" on storage.objects;
create policy "produtos bucket: upload autenticado"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos');

drop policy if exists "produtos bucket: update autenticado" on storage.objects;
create policy "produtos bucket: update autenticado"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produtos') with check (bucket_id = 'produtos');

drop policy if exists "produtos bucket: delete autenticado" on storage.objects;
create policy "produtos bucket: delete autenticado"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos');
