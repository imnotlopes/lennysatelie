-- Etiquetas que a dona pode gerenciar.
--
-- Antes as cinco sugestões viviam fixas no código do formulário, então trocar
-- "Promoção" por "Últimas peças" exigia um desenvolvedor. Agora ela edita a
-- lista pelo painel.
--
-- A etiqueta continua gravada como texto em `produtos.etiqueta`, e não como
-- chave estrangeira daqui. É de propósito: apagar uma etiqueta da lista não
-- pode apagar o selo das peças que já a usam. Esta tabela é o catálogo de
-- sugestões, não o dono do dado.
create table if not exists public.etiquetas (
  id         uuid primary key default gen_random_uuid(),
  texto      text not null unique,
  ordem      integer not null default 0,
  created_at timestamptz not null default now(),
  -- Mesmo limite do campo no formulário: acima disso o selo não cabe no canto
  -- da foto. Validado aqui também para o banco não aceitar o que a tela recusa.
  constraint etiquetas_texto_cabe check (char_length(trim(texto)) between 1 and 18)
);

alter table public.etiquetas enable row level security;

-- Só o painel usa esta lista. O site público lê `produtos.etiqueta`, que já é
-- texto solto, então não há motivo para expor o catálogo ao anônimo.
drop policy if exists "etiquetas: leitura autenticada" on public.etiquetas;
create policy "etiquetas: leitura autenticada"
  on public.etiquetas for select
  to authenticated
  using (true);

drop policy if exists "etiquetas: escrita autenticada" on public.etiquetas;
create policy "etiquetas: escrita autenticada"
  on public.etiquetas for all
  to authenticated
  using (true) with check (true);

create index if not exists etiquetas_ordem_idx on public.etiquetas (ordem, texto);

-- As cinco que estavam fixas no código, para ela começar com algo em vez de
-- uma tela vazia.
insert into public.etiquetas (texto, ordem) values
  ('Novidade', 1),
  ('Última peça', 2),
  ('Mais alugado', 3),
  ('Promoção', 4),
  ('Sob medida', 5)
on conflict (texto) do nothing;
