# Colocar o site no ar

Passo a passo para publicar na Vercel. Escrito para quem desenvolve, não para
a dona do ateliê — o manual dela é o `MANUAL.md`.

---

## 1. O que precisa existir antes

| | |
|---|---|
| Projeto Supabase | `qfnbcdlrvhesdehjbudw`, região São Paulo |
| Migrations aplicadas | `001_schema` · `002_preco_original` · `003_cupom_inicio` · `preco_locacao` nulo · grant do nome da influenciadora · fuso da validade do cupom |
| Bucket | `produtos`, público |
| Usuário do painel | criado à mão (ver seção 4) |

## 2. Variáveis de ambiente

Três, e as três são públicas por natureza:

```
NEXT_PUBLIC_SUPABASE_URL=https://qfnbcdlrvhesdehjbudw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon do painel do Supabase>
NEXT_PUBLIC_SITE_URL=<endereço do site, sem barra no fim>
```

As duas primeiras pegue em **Project Settings > API**.

A terceira é o endereço público. **No primeiro deploy o domínio ainda não
existe**, então use o que a Vercel deu:

```
NEXT_PUBLIC_SITE_URL=https://lennysatelie.vercel.app
```

Sem ela, o site assume `https://lennysatelie.com.br`. Enquanto esse domínio
não estiver apontando para a Vercel, o canonical de toda página, o sitemap
inteiro e o link de cupom que a dona copia do painel apontam para um endereço
que não resolve — e o Google indexa o canonical, não a página onde ele está.

Quando o domínio entrar, troque a variável e refaça o deploy. Nenhuma linha de
código muda.

**Nunca coloque a `service_role` aqui.** Ela ignora toda a Row Level Security,
e o prefixo `NEXT_PUBLIC_` a exporia no JavaScript do navegador. Se ela vazar,
qualquer pessoa apaga o acervo inteiro.

O site inteiro funciona só com a `anon` porque a segurança está na RLS do
banco, não em esconder a chave.

## 3. Publicar na Vercel

1. Em [vercel.com](https://vercel.com), **Add New > Project** e importe o
   repositório
2. Framework: **Next.js** (detectado sozinho)
3. Em **Environment Variables**, cole as duas variáveis acima, marcando
   Production, Preview e Development
4. **Deploy**

Depois do primeiro deploy, em **Settings > Domains**, aponte o domínio
definitivo.

> **Ao trocar o domínio, mude também `lib/admin/site.ts`.** É de lá que saem o
> canonical, o sitemap, o Open Graph e o link do cupom que vai para a
> influenciadora. Com o valor errado, o Google indexa endereço que não existe.

## 4. Criar o acesso da dona

No painel do Supabase, **Authentication > Users > Add user > Create new user**:

- E-mail e senha
- **Marque `Auto Confirm User`** — sem isso o Supabase espera uma confirmação
  por e-mail que nunca chega, e o login falha mesmo com a senha certa

Não existe cadastro público: essa é a única porta de entrada do painel.

## 5. Conferir se está tudo de pé

```bash
npm run verificar-banco
```

Conecta com a chave anônima, ou seja, enxerga o que uma visitante enxerga, e
confere as tabelas, o join de categoria, o filtro e — o mais importante — que
a RLS está barrando o que deve barrar.

Termina com "Tudo certo" ou lista o que falhou.

---

## Decisões que valem entender antes de mexer

### O site é renderizado sob demanda, não estático

Toda página lê o cookie do cupom de influenciadora, e `cookies()` é API
dinâmica no Next. Isso custa a geração estática, e foi uma escolha: desconto
por visitante não cabe numa página em cache.

Se um dia o custo incomodar, o caminho é aplicar o cupom no cliente e aceitar
um piscar do preço cheio antes do desconto.

### Slug de vestido inexistente responde 200, não 404

`/acervo/nao-existe` mostra a página de erro mas com status 200 — um soft 404.
Resolver com `dynamicParams = false` daria o 404 correto, **mas** faria uma
peça cadastrada pelo painel só aparecer no próximo deploy, porque
`generateStaticParams` só roda no build.

Entre um soft 404 e um painel que não publica, o segundo é o problema grave.
Se quiser resolver de verdade, o caminho é um deploy hook da Vercel disparado
ao salvar uma peça.

### O acervo tem canonical sem query

`/acervo?cor=Azul+royal&tamanho=P` declara canonical para `/acervo`. Os filtros
geram combinações infinitas do mesmo conteúdo; sem isso o Google trataria cada
uma como página separada.

---

## Comandos

```bash
npm run dev              # desenvolvimento
npm run build            # build de produção
npm run verificar-banco  # checa banco e RLS com a chave pública
```

**Nunca rode `npm run build` com o `npm run dev` aberto.** Os dois usam a pasta
`.next` e o manifesto de chunks corrompe, produzindo `Cannot find module`. Pare
um antes de rodar o outro, e apague `.next` entre eles.
