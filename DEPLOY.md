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

Sem ela, o site assume `https://www.lennysatelie.com.br`. Enquanto esse domínio
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
3. Em **Environment Variables**, cole as três variáveis acima, marcando
   Production, Preview e Development
4. **Deploy**

No primeiro deploy você ainda não sabe o endereço, então ponha um palpite em
`NEXT_PUBLIC_SITE_URL` e corrija depois: a Vercel mostra a URL final ao
terminar. Trocar a variável e clicar em **Redeploy** resolve.

Depois, em **Settings > Domains**, aponte o domínio definitivo — e **volte na
variável** para o endereço novo. O passo a passo está na seção seguinte.

> É de `NEXT_PUBLIC_SITE_URL` que saem o canonical, o sitemap, o Open Graph e
> o link do cupom que vai para a influenciadora. Com o valor errado, o Google
> indexa endereço que não existe. Nenhum código muda: só a variável.

## 4. Apontar o domínio www.lennysatelie.com.br

### O endereço canônico é UM só

O site foi configurado com **`www`**. Isso precisa valer nos dois lugares:

- No código, em `lib/admin/site.ts` (já está)
- Na Vercel, marcando `www.lennysatelie.com.br` como **Primary Domain**

Se um disser `www` e o outro disser o apex, o canonical de toda página aponta
para um endereço diferente do que a visitante está vendo, e o Google trata os
dois como páginas duplicadas competindo entre si. Para inverter e usar o apex,
troque nos **dois** lugares, nunca em um só.

### 4.1 Registrar o domínio

`.com.br` se registra no [registro.br](https://registro.br), e exige CPF ou
CNPJ do titular. **Registre em nome da Lennys, não no seu** — domínio no nome
de terceiro é dor de cabeça no dia em que alguém precisa renovar ou transferir.

Anote a data de vencimento. `.com.br` não avisa com insistência, e domínio
vencido tira o site do ar.

### 4.2 Adicionar o domínio na Vercel

Em **Settings > Domains**, adicione os dois:

1. `www.lennysatelie.com.br` — e marque como **Primary**
2. `lennysatelie.com.br` — a Vercel cria sozinha o redirecionamento 301 para o
   www

Os dois são necessários. Quem digitar o endereço sem `www` precisa chegar ao
mesmo lugar, com redirecionamento permanente — senão o Google indexa os dois.

### 4.3 Criar os registros de DNS

A Vercel mostra os valores exatos na própria tela de Domains, **e é de lá que
você deve copiar** — os endereços dela mudam de tempos em tempos, e um valor
decorado errado deixa o site fora do ar sem erro visível.

O formato costuma ser:

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `@` (o apex) | o IP que a Vercel mostrar |
| `CNAME` | `www` | o destino que a Vercel mostrar |

No registro.br isso fica em **Editar Zona DNS**. A propagação leva de minutos
a algumas horas; a Vercel emite o certificado HTTPS sozinha assim que o DNS
responder.

### 4.4 Trocar a variável e refazer o deploy

```
NEXT_PUBLIC_SITE_URL=https://www.lennysatelie.com.br
```

Em **Settings > Environment Variables**, e depois **Redeploy**. Sem o redeploy
a variável nova não entra: ela é lida na hora de compilar.

### 4.5 Conferir depois que subir

```bash
curl -sI https://lennysatelie.com.br | head -3
```

Tem que responder `301` apontando para o `www`.

```bash
curl -s https://www.lennysatelie.com.br | grep -o 'rel="canonical" href="[^"]*"'
```

Tem que dizer `https://www.lennysatelie.com.br`, sem barra no fim e sem
`vercel.app`. Se aparecer o endereço da Vercel, a variável não foi trocada ou
faltou o redeploy.

Confira também o sitemap:

```bash
curl -s https://www.lennysatelie.com.br/sitemap.xml | head -5
```

Todos os endereços ali devem começar com `https://www.lennysatelie.com.br`.

### 4.6 Só depois disso

- **Google Search Console**: registre a propriedade e envie o sitemap
- **Perfil da Empresa no Google**: o ateliê já aparece no Maps, então é
  reivindicar o perfil existente e pôr o endereço do site nele. Para negócio
  local isso pesa mais que qualquer ajuste de página
- Atualizar o link na bio do Instagram

## 5. Apontar links.lennysatelie.com.br

A página de links mora no **mesmo projeto e no mesmo deploy** do site. Quem
separa os dois é o `middleware.ts`, olhando o host da requisição. Então aqui
não se cria projeto novo na Vercel — se acrescenta um domínio ao que já existe.

### 5.1 Adicionar o domínio na Vercel, ANTES do DNS

Nesta ordem de propósito: a Vercel só mostra o valor certo de DNS depois que o
domínio está cadastrado, e é dela que o valor deve ser copiado.

Em **Settings > Domains** do projeto do site (o mesmo, não um novo):

1. **Add Domain** e escreva `links.lennysatelie.com.br`
2. **NÃO marque como Primary.** O Primary continua sendo
   `www.lennysatelie.com.br`. Marcar o subdomínio faria o canonical de todas as
   páginas do site apontar para ele, e o Google passaria a tratar o site
   inteiro como cópia da página de links
3. A Vercel vai mostrar um aviso de "Invalid Configuration" com o registro que
   falta. **Copie o valor dali**, não daqui: os endereços dela mudam de tempos
   em tempos

O valor costuma ser um CNAME apontando para `cname.vercel-dns.com`, mas confira
na tela.

### 5.2 Criar o registro no registro.br

Entre em [registro.br](https://registro.br), abra o domínio
`lennysatelie.com.br` e vá em **Editar Zona DNS**.

Isso só funciona se o domínio estiver usando os servidores DNS do próprio
registro.br. Se estiver delegado para outro lugar (Cloudflare, por exemplo), o
registro precisa ser criado lá, não aqui.

Acrescente uma linha:

| Campo | O que escrever |
|---|---|
| Nome | `links` |
| Tipo | `CNAME` |
| Dados | o valor que a Vercel mostrou |

Dois detalhes que derrubam quem faz pela primeira vez:

- **No campo Nome vai só `links`**, e não o endereço inteiro. O registro.br
  completa com o domínio sozinho. Escrever
  `links.lennysatelie.com.br` ali cria `links.lennysatelie.com.br.lennysatelie.com.br`
- **O valor do CNAME costuma precisar de ponto final**: `cname.vercel-dns.com.`
  O registro.br avisa quando falta, mas nem sempre de forma clara

Salve e confirme. A propagação leva de minutos a algumas horas.

### 5.3 Esperar o certificado

A Vercel emite o HTTPS sozinha assim que o DNS responder. Na tela de Domains o
aviso de "Invalid Configuration" vira "Valid Configuration" — não precisa fazer
nada além de esperar e recarregar a página.

### 5.4 Conferir

```bash
curl -sI https://links.lennysatelie.com.br | head -3
```

Tem que responder `200`.

```bash
curl -sI https://links.lennysatelie.com.br/acervo | head -3
```

Tem que responder `308` apontando para `https://www.lennysatelie.com.br/acervo`.
**Este é o teste que importa.** Se responder `200` com o acervo, a reescrita do
middleware está servindo o site inteiro no subdomínio, e aí existem duas cópias
do site competindo entre si no Google — o contrário do que o subdomínio serve.

```bash
curl -s https://links.lennysatelie.com.br | grep -o 'rel="canonical" href="[^"]*"'
```

Tem que dizer `https://links.lennysatelie.com.br`, e não o endereço do site.

### 5.5 Variável de ambiente

Só é necessária se o endereço for diferente do padrão. O código já assume
`https://links.lennysatelie.com.br` quando a variável não existe:

```
NEXT_PUBLIC_SITE_LINKS_URL=https://links.lennysatelie.com.br
```

Se você a definir, precisa **Redeploy** depois: ela é lida na hora de compilar.

### 5.6 Depois que subir

- **Search Console**: cadastre `links.lennysatelie.com.br` como propriedade
  **separada**. Para o Google, subdomínio é outro site — o sitemap do domínio
  principal não cobre ele
- Trocar o link da bio do Instagram para o novo endereço

## 6. Criar o acesso da dona

No painel do Supabase, **Authentication > Users > Add user > Create new user**:

- E-mail e senha
- **Marque `Auto Confirm User`** — sem isso o Supabase espera uma confirmação
  por e-mail que nunca chega, e o login falha mesmo com a senha certa

Não existe cadastro público: essa é a única porta de entrada do painel.

## 7. Conferir se está tudo de pé

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

O que **não** se paga por isso é a consulta ao banco. `getConfiguracoes()`
está em cache por tag (`configuracoes`), invalidado com `updateTag` quando a
dona salva no painel. Sem isso, cada carregamento de cada página relia o mesmo
telefone e o mesmo endereço: medido em produção, o TTFB da home caiu de 1336ms
para 22ms.

Se um dia o custo da renderização dinâmica incomodar, o caminho é aplicar o
cupom no cliente e aceitar um piscar do preço cheio antes do desconto.

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
