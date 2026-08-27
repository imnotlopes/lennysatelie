-- ============================================================================
-- Lennys Atelie - acervo real
--
-- Rode DEPOIS de 001_schema.sql e 002_preco_original.sql. Idempotente.
--
-- Transcrito do catalogo enviado pela Lennys. Tres coisas a saber:
--
-- 1. So entram pecas de LOCACAO. Os itens marcados "Venda" (R$ 129) e as
--    quatro "Opcao sob medidas" ficaram de fora, conforme combinado.
-- 2. Nomes repetidos no catalogo (Naely, Roberta, Bianca, Viviane, Elisana,
--    Steline) viraram uma peca so, com o primeiro preco visto. `slug` e
--    unique, entao duplicata colidiria. Vale a Lennys revisar.
-- 3. `tamanho` fica vazio onde o catalogo nao informava. Sem isso o filtro de
--    tamanho do acervo nao acha a peca - e o primeiro campo a preencher no
--    painel.
--
-- As cores foram lidas das fotos do catalogo e sao aproximadas.
-- `imagens` fica vazio: as fotos ainda nao subiram para o bucket.
-- ============================================================================

-- ---- Categorias -------------------------------------------------------------

insert into public.categorias (nome, slug, imagem_capa, ordem) values
  ('Casamento no civil', 'casamento-civil', null, 1),
  ('Festa',              'festa',           null, 2)
on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem;

-- Os prints do catalogo mostram que a colecao "Casamento no Civil" contem as
-- pecas que eu havia separado como "Noiva". Sao uma colecao so.
delete from public.categorias where slug = 'noiva';

-- Remove as categorias ficticias do seed antigo, se ainda existirem.
delete from public.produtos
  where categoria_id in (
    select id from public.categorias where slug in ('bordados', 'lisos', 'tule')
  );
delete from public.categorias where slug in ('bordados', 'lisos', 'tule');

-- ---- Produtos ---------------------------------------------------------------

insert into public.produtos
  (nome, slug, descricao, preco_locacao, preco_original, tamanho, cor,
   categoria_id, imagens, destaque, ordem)
values
  ('Vestidos de cartório', 'vestidos-de-cartorio', null, 299, null, array['P','G']::text[], 'Off white', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], true, 1),
  ('Vestido Naely', 'vestido-naely', null, 399, 520, '{}'::text[], 'Off white', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], true, 2),
  ('Vestido Steline', 'vestido-steline', null, 499, 890, '{}'::text[], 'Off white', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 3),
  ('Vestido Lilly', 'vestido-lilly', null, 490, 529, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 4),
  ('Vestido Luliz', 'vestido-luliz', null, 620, 929, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], true, 5),
  ('Vestido Ashiley', 'vestido-ashiley', null, 520, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 6),
  ('Vestido Thalita', 'vestido-thalita', null, 620, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 7),
  ('Vestido Layla', 'vestido-layla', null, 729, 990, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], true, 8),
  ('Vestido Leidy', 'vestido-leidy', null, 429, 590, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 9),
  ('Vestido Fayne', 'vestido-fayne', null, 629, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 10),
  ('Vestido Kafanny', 'vestido-kafanny', null, 489, 580, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 11),
  ('Vestido Kally', 'vestido-kally', null, 499, 849, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 12),
  ('Vestido Rayale', 'vestido-rayale', null, 129, 399, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 13),
  ('Noiva Vallery', 'noiva-vallery', null, null, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 14),
  ('Vestido Thalia', 'vestido-thalia', null, 389, 529, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 15),
  ('Vestido Kupper', 'vestido-kupper', null, 299, 389, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 16),
  ('Vestido Raquel Noiva', 'vestido-raquel-noiva', null, 490, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 17),
  ('Vestido Viviane', 'vestido-viviane', null, 499, 589, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 18),
  ('Vestido Jaquet', 'vestido-jaquet', null, null, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 19),
  ('Vestido Lidiane', 'vestido-lidiane', null, 320, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 20),
  ('Vestido Juelisa', 'vestido-juelisa', null, 499, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 21),
  ('Vestido Derenise', 'vestido-derenise', null, 299, null, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 22),
  ('Vestido Sammy', 'vestido-sammy', null, 389, 490, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 23),
  ('Vestido Norma', 'vestido-norma', null, 369, 490, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 24),
  ('Vestido Alana Noiva', 'vestido-alana-noiva', null, 490, 569, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 25),
  ('Vestido Vallery', 'vestido-vallery', null, 320, 429, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 26),
  ('Vestido Erian', 'vestido-erian', null, 299, 349, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 27),
  ('Vestido Milian', 'vestido-milian', null, 299, 429, '{}'::text[], 'Rosé', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 28),
  ('Vestido Joy', 'vestido-joy', null, 399, 520, '{}'::text[], 'Branco', (select id from public.categorias where slug = 'casamento-civil'), '{}'::text[], false, 29),
  ('Vestido Serenity', 'vestido-serenity', null, 280, null, '{}'::text[], 'Azul serenity', (select id from public.categorias where slug = 'festa'), '{}'::text[], true, 30),
  ('Vestido Kiany', 'vestido-kiany', null, 290, null, '{}'::text[], 'Azul claro', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 31),
  ('Vestido Anastácia', 'vestido-anastacia', null, 320, null, '{}'::text[], 'Azul claro', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 32),
  ('Vestido Roberta', 'vestido-roberta', null, 290, null, array['P','M','G']::text[], 'Azul claro', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 33),
  ('Vestido Elisana', 'vestido-elisana', null, 290, null, array['P','M','G']::text[], 'Azul claro', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 34),
  ('Vestido Dora', 'vestido-dora', null, 429, null, '{}'::text[], 'Azul marinho', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 35),
  ('Vestido Romana', 'vestido-romana', null, 390, null, '{}'::text[], 'Azul marinho', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 36),
  ('Vestido Bianca', 'vestido-bianca', null, 300, null, '{}'::text[], 'Azul marinho', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 37),
  ('Vestido Ruanita', 'vestido-ruanita', null, 329, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 38),
  ('Vestido Isla', 'vestido-isla', null, 729, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], true, 39),
  ('Vestido Isis', 'vestido-isis', null, 300, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 40),
  ('Vestido Audrey', 'vestido-audrey', null, 580, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], true, 41),
  ('Vestido Lany', 'vestido-lany', null, 310, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 42),
  ('Vestido Juliette', 'vestido-juliette', null, 280, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 43),
  ('Vestido Rochele', 'vestido-rochele', null, 360, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 44),
  ('Vestido Azul Royal', 'vestido-azul-royal', null, 260, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 45),
  ('Vestido Aline', 'vestido-aline', null, 270, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 46),
  ('Vestido Juliana', 'vestido-juliana', null, 280, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 47),
  ('Vestido Raquel', 'vestido-raquel', null, 290, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 48),
  ('Vestido Kellen', 'vestido-kellen', null, 260, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 49),
  ('Vestido Isa', 'vestido-isa', null, 280, null, '{}'::text[], 'Azul royal', (select id from public.categorias where slug = 'festa'), '{}'::text[], false, 50)
on conflict (slug) do update set
  nome           = excluded.nome,
  preco_locacao  = excluded.preco_locacao,
  preco_original = excluded.preco_original,
  tamanho        = excluded.tamanho,
  cor            = excluded.cor,
  categoria_id   = excluded.categoria_id,
  destaque       = excluded.destaque,
  ordem          = excluded.ordem;

-- ---- Cupons -----------------------------------------------------------------

insert into public.cupons
  (codigo, influenciadora_nome, influenciadora_instagram, tipo_desconto,
   valor, ativo, validade, limite_usos)
values
  ('MARIANA10', 'Mariana Costa', '@maricosta',  'percentual', 10, true, null, null),
  ('JULIA50',   'Julia Ramos',   '@juliaramos', 'fixo',       50, true, null, 100)
on conflict (codigo) do nothing;

-- ---- Configuracoes ----------------------------------------------------------

insert into public.configuracoes (chave, valor) values
  (
    'contato',
    '{
      "whatsapp": "5511958564840",
      "telefone": "(11) 95856-4840",
      "email": "atelielennys@gmail.com",
      "endereco": "Rua Nicolau Mayevsky, 128 - Jardim Sol Nascente, Jandira, SP",
      "instagram": "@lennys_atelie",
      "facebook": "https://www.facebook.com/lennysatelie"
    }'::jsonb
  ),
  (
    'whatsapp_template',
    '{
      "mensagem": "Ola! Tenho interesse no {nome} ({preco}). Link: {url}"
    }'::jsonb
  )
on conflict (chave) do update set valor = excluded.valor;
