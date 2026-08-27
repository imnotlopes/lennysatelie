# Como ligar o banco

Passo a passo para sair do zero até `getProdutos()` devolvendo os 6 vestidos.
Leva uns 10 minutos.

> **Este SQL não foi executado.** Não há Docker nem `psql` nesta máquina, então
> escrevi a migration contra a documentação do Postgres e do Supabase, mas ela
> nunca rodou. Se algum passo abaixo der erro, me manda a mensagem que eu
> corrijo.

---

## 1. Criar o projeto no Supabase

1. Entre em [supabase.com](https://supabase.com) e crie um projeto novo
2. Região: **South America (São Paulo)** — é a mais próxima e reduz a latência
3. Guarde a senha do banco que ele pedir para definir
4. Espere terminar de provisionar (uns 2 minutos)

## 2. Rodar o schema

1. No menu lateral, abra **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo inteiro de `migrations/001_schema.sql`
4. **Run**

Deve terminar com "Success. No rows returned".

> Se o bloco de Storage no fim do arquivo der `must be owner of table objects`,
> pule essa parte e crie o bucket pela interface: **Storage > New bucket**, nome
> `produtos`, marque **Public bucket**. Depois use **Storage > Policies** para
> permitir `insert`, `update` e `delete` apenas para `authenticated`.

## 2b. Rodar a migration do preco promocional

**New query**, cole `migrations/002_preco_original.sql`, **Run**.

Adiciona `preco_original` em produtos, para as pecas anunciadas com valor
cheio riscado ao lado. Se voce ja rodou o 001 antes, so precisa deste.

## 3. Rodar o seed

Mesma coisa: **New query**, cole `seed.sql`, **Run**.

Confira em **Table Editor** que `produtos` tem 50 linhas e `categorias` tem 3.

As fotos apontam para caminhos que ainda não existem no bucket. É esperado —
o que importa agora é ter forma e quantidade para montar as telas das próximas
etapas.

## 4. Preencher as variáveis

1. Em **Project Settings > API**, copie a **Project URL** e a chave **anon /
   public**
2. Na raiz do projeto, copie `.env.example` para `.env.local`
3. Preencha as duas variáveis

```bash
cp .env.example .env.local
```

Nunca coloque a chave `service_role` no `.env.local`. Ela ignora a RLS inteira
e o `NEXT_PUBLIC_` a exporia no browser.

## 5. Conferir

Um comando responde tudo:

```bash
npm run verificar-banco
```

Ele conecta com a chave anonima, ou seja, enxerga o que uma visitante do site
enxerga, e confere:

- as 3 categorias, os 6 produtos e as 2 configuracoes do seed
- a consulta principal com o join produto -> categoria
- o filtro por categoria (o `!inner` do PostgREST)
- que o publico **nao** le as colunas da influenciadora nem a tabela `eventos`
- que o publico **nao** consegue escrever em `produtos`
- que o registro de evento funciona
- que o bucket `produtos` esta acessivel

Termina com "Tudo certo" ou lista o que falhou. Deixa uma linha de teste em
`eventos`, que voce pode apagar pelo painel.

Depois disso, reinicie o `npm run dev` — variavel de ambiente so e lida na
subida do servidor.

---

## O que a RLS está fazendo

| Tabela | Público (anon) | Autenticado |
|---|---|---|
| `categorias` | lê tudo | lê e escreve |
| `produtos` | lê só `ativo = true` | lê tudo e escreve |
| `cupons` | lê só cupom válido, e sem as colunas da influenciadora | lê tudo e escreve |
| `eventos` | só insere | lê, insere e apaga |
| `configuracoes` | lê | lê e escreve |

Dois detalhes que valem saber:

**Cupom inválido não existe.** Um código expirado, desativado ou que estourou o
limite de usos não volta da consulta pública — a policy já o descarta. Do lado
do site, "não existe" e "expirou" são a mesma resposta, de propósito: não dá
pista para quem fica testando código.

**RLS filtra linha, não coluna.** Para esconder `influenciadora_nome` e
`influenciadora_instagram` do público, a migration usa `GRANT` por coluna. Como
efeito colateral, um `select *` em `cupons` feito pelo papel `anon` falha com
permissão negada. É intencional. Use sempre a lista explícita de colunas, como
`getCupomByCodigo()` faz.

---

## Divergência da especificação

O documento de prompts pedia, para a RLS, "produtos e categorias: select
público quando `ativo = true`". Mas `categorias` não tem coluna `ativo` na lista
de colunas especificada.

Mantive as colunas exatamente como você escreveu e deixei a leitura de
`categorias` pública sem condição. Se quiser poder despublicar uma categoria,
são duas linhas:

```sql
alter table public.categorias add column ativo boolean not null default true;
-- e trocar o `using (true)` da policy "categorias: leitura publica" por `using (ativo = true)`
```

---

## Regerar os tipos (opcional, e nao precisa agora)

`lib/supabase/types.ts` ja esta escrito a mao e espelha a migration. **Ele
funciona. Voce nao precisa rodar nada aqui.** Esta secao so serve para o dia em
que o schema mudar e voce quiser regerar do banco real em vez de editar a mao.

No Windows, a forma ingenua do comando quebra o arquivo de duas maneiras ao
mesmo tempo:

- o `npx` pergunta "Ok to proceed?" na primeira vez, e a pergunta cai dentro do
  arquivo redirecionado
- o `>` do PowerShell grava em UTF-16, nao em UTF-8

O comando correto instala sem perguntar e forca a codificacao:

```powershell
npx --yes supabase gen types typescript --project-id COLE_SEU_ID_AQUI | Out-File -Encoding utf8 lib/supabase/types.ts
```

Troque `COLE_SEU_ID_AQUI` pelo ID real do projeto, que aparece na URL do painel
(`https://supabase.com/dashboard/project/SEU_ID`). Rodar com o placeholder
literal deixa o processo pendurado esperando input.

Depois de regerar, confira com `npx tsc --noEmit` e relembre de trazer de volta
os atalhos do fim do arquivo (`Categoria`, `Produto`, `CupomPublico`,
`ProdutoComCategoria`), que sao nossos e o gerador nao conhece.
