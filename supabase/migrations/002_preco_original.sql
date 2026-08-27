-- ============================================================================
-- Lennys Ateliê — preço promocional
--
-- Rode depois de 001_schema.sql. Também é idempotente.
--
-- Boa parte do catálogo é anunciada como "R$ 399,00" com "R$ 520,00" riscado
-- ao lado. O design system extraído já prevê isso (`--price-original` e
-- `--price-sale`), mas faltava onde guardar o valor cheio.
-- ============================================================================

alter table public.produtos
  add column if not exists preco_original numeric(10, 2);

comment on column public.produtos.preco_original is
  'Valor cheio, exibido riscado ao lado do preco_locacao. Nulo quando a peça não está em promoção.';

-- O valor cheio precisa ser maior que o cobrado, senão a peça aparece com um
-- "desconto" negativo na vitrine.
alter table public.produtos
  drop constraint if exists produtos_preco_original_maior;

alter table public.produtos
  add constraint produtos_preco_original_maior
  check (preco_original is null or preco_original > preco_locacao);
