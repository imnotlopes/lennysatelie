-- Faixa de aviso do topo do site.
--
-- Entra desligada e com a data de fim da Black Friday de 2026 já escrita. A
-- Lennys liga pelo painel, em Configurações, quando quiser que apareça.
--
-- Fica em `configuracoes` e não no código porque é recado, não funcionalidade:
-- muda de texto e de data toda campanha, e ninguém deveria precisar de um
-- deploy para trocar uma frase.
--
-- `inicio` e `fim` são texto "AAAA-MM-DD" de propósito, e não `date`: a coluna
-- é um jsonb só, e a comparação acontece na aplicação contra a data de hoje em
-- São Paulo. Ver a explicação em lib/aviso.ts.

insert into public.configuracoes (chave, valor)
values (
  'aviso',
  jsonb_build_object(
    'ativo', false,
    'texto', 'Black Friday no ateliê · até 30 de novembro',
    'link', 'https://wa.me/5511958564840',
    'inicio', '',
    'fim', '2026-11-30'
  )
)
on conflict (chave) do nothing;
