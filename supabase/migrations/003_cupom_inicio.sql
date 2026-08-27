-- ============================================================================
-- Lennys Ateliê — data de início do cupom
--
-- Rode depois de 002_preco_original.sql. Idempotente.
--
-- Até aqui o cupom só tinha fim (`validade`). Campanha marcada para estrear
-- numa data exigia que a dona lembrasse de ligar a chave no dia certo; se
-- esquecesse, a influenciadora publicava e o link não descontava nada.
--
-- Nota: duas alterações anteriores foram aplicadas direto no banco e não têm
-- arquivo aqui — `preco_locacao` virou nula (para "sob consulta") e a coluna
-- `influenciadora_nome` foi exposta ao papel anon (para o banner). Quem
-- recriar o banco do zero por estes arquivos precisa refazer as duas.
-- ============================================================================

alter table public.cupons
  add column if not exists inicio date;

comment on column public.cupons.inicio is
  'Primeiro dia em que o cupom vale. Nulo significa que vale desde já.';

-- Um cupom que começa depois de vencer nunca valeria um único dia.
alter table public.cupons
  drop constraint if exists cupons_periodo_coerente;

alter table public.cupons
  add constraint cupons_periodo_coerente
  check (inicio is null or validade is null or inicio <= validade);

-- `current_date` no Supabase é UTC. Das 21h à meia-noite o banco já acharia
-- que virou o dia: um cupom válido "até hoje" morreria três horas antes, e um
-- agendado para amanhã começaria a valer na véspera à noite.
create or replace function public.hoje_brt()
  returns date
  language sql
  stable
  set search_path = ''
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

comment on function public.hoje_brt() is
  'Data corrente no fuso de Jandira. Usada pela RLS dos cupons.';

-- A RLS é a trava de verdade: sem ela, um cupom agendado apareceria para quem
-- consultasse a tabela direto pela API pública antes da data.
drop policy if exists "cupons: leitura publica dos validos" on public.cupons;

create policy "cupons: leitura publica dos validos"
  on public.cupons for select to anon
  using (
    ativo = true
    and (inicio is null or inicio <= public.hoje_brt())
    and (validade is null or validade >= public.hoje_brt())
    and (limite_usos is null or usos < limite_usos)
  );
