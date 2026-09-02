-- Foto de topo da página da coleção.
--
-- Separada da `imagem_capa` porque são recortes diferentes: a capa é o cartão
-- 3:4 da página inicial, e o hero é uma faixa larga no topo do acervo
-- filtrado. Uma foto enquadrada para um dos dois fica errada no outro — ou a
-- modelo perde a cabeça no cartão, ou sobra teto vazio na faixa.
--
-- Vazia significa "usa a capa". A coleção que ainda não tem hero próprio
-- continua funcionando, só com a foto do cartão no topo.
alter table public.categorias
  add column if not exists imagem_hero text;

comment on column public.categorias.imagem_hero is
  'Foto larga do topo da página da coleção. Vazia cai na imagem_capa.';
