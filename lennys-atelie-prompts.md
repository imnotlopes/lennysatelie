# Lennys Ateliê: site de locação de vestidos

Sequência de prompts para execução no Claude Code.

---

## Como usar este documento

Cada etapa tem três partes: objetivo, plano de ação e o prompt pronto para colar.

**Execute uma etapa por vez.** Cole o prompt, espere o Claude Code terminar, valide o critério de aceite na sua máquina, e só então avance. Não cole dois prompts na mesma mensagem. Não peça para "fazer as etapas 4 a 7 de uma vez".

O motivo é prático: cada etapa produz decisões que a próxima assume como verdade. Se a etapa 2 criar um schema diferente do que você imaginava e você só descobrir na etapa 9, o retrabalho é grande.

Antes de começar, crie o arquivo `CLAUDE.md` na raiz do projeto com o conteúdo da seção "Regras permanentes" abaixo. Ele vai ser lido automaticamente em toda sessão e evita que você repita as mesmas instruções.

---

## Regras permanentes

Copie o bloco abaixo para o arquivo `CLAUDE.md` na raiz do projeto antes da primeira etapa.

```markdown
# Regras do projeto Lennys Ateliê

## Ritmo de execução
- Execute apenas o que foi pedido no prompt atual. Não antecipe etapas futuras.
- Antes de escrever código, apresente um plano curto do que vai fazer e em quais
  arquivos vai mexer. Espere confirmação.
- Ao terminar, liste os arquivos criados ou alterados e diga como validar.
- Se encontrar ambiguidade, pergunte. Não decida por conta própria e siga em frente.
- Não instale dependências não solicitadas. Se achar que uma é necessária,
  justifique e pergunte antes.

## Código
- TypeScript estrito. Sem `any`.
- Server Components por padrão. `"use client"` apenas quando houver estado,
  evento ou hook de browser, e sempre no componente mais interno possível.
- Toda query ao banco vive em /lib/queries. Nenhum componente chama o Supabase
  diretamente.
- Toda regra de negócio (cálculo de preço, montagem de mensagem) vive em /lib.
  Componentes só renderizam.
- Nomes de variáveis, funções e arquivos em inglês. Textos de interface em
  português do Brasil.
- Sem emojis em nenhum lugar do código ou da interface.

## Interface
- Nada de valor hardcoded que já exista no design system. Cor, espaçamento,
  raio e tipografia sempre via token.
- Mobile first. Toda tela precisa funcionar em 375px de largura.
- Foco de teclado visível, contraste mínimo AA, alt em toda imagem de produto.
- Textos de interface em voz ativa e linguagem simples. O botão diz o que
  acontece ao ser clicado. Erro explica o que fazer, não pede desculpa.

## Contexto do negócio
- O site é vitrine e captação. Não existe checkout, carrinho ou pagamento online.
- Todo fechamento acontece no WhatsApp.
- O painel administrativo vai ser operado pela dona do ateliê, que não é
  desenvolvedora. Zero jargão técnico na interface.
```

---

## Premissas do escopo

Três decisões que definem o produto. Se alguma mudar, os prompts afetados precisam ser reescritos.

**Sem pagamento online.** Todo fechamento acontece no WhatsApp. O site é vitrine, filtro e captação de conversa qualificada.

**Sem calendário de disponibilidade na versão 1.** A cliente escolhe o vestido e a data é acertada no WhatsApp. Reserva com data no banco fica para a versão 2, quando a dona já estiver usando o painel com naturalidade.

**Cupom de influenciadora aplica desconto visível e rastreia origem.** As duas coisas ao mesmo tempo. Sem o rastreio, contratar influenciadora vira achismo.

---

## Stack

Next.js 15 com App Router, TypeScript, Tailwind CSS, Supabase (Postgres, Auth e Storage) e deploy na Vercel.

Next.js e não Vite porque cada página de vestido precisa ser indexável no Google. A tese comercial do projeto, uma vitrine que trabalha enquanto o ateliê está fechado, não se sustenta num SPA que renderiza só no cliente.

---

## Modelo de dados

| Tabela | Função |
|---|---|
| `produtos` | vestido, preço de locação, tamanhos, cor, imagens, destaque, ativo |
| `categorias` | bordados, lisos, tule, brilho e outras |
| `cupons` | código, influenciadora, tipo e valor do desconto, validade, limite |
| `eventos` | visita de produto, cupom aplicado, clique no WhatsApp |
| `configuracoes` | número do WhatsApp, template da mensagem, dados de contato |

A tabela `eventos` é o que transforma o cupom em métrica de campanha em vez de um código solto.

---

# Etapa 1: Fundação e design system

## Objetivo
Projeto inicializado com o design system extraído já aplicado e validado visualmente.

## Plano de ação
- Inicializar Next.js 15 com App Router, TypeScript e Tailwind
- Traduzir os tokens do design system para CSS variables e `tailwind.config.ts`
- Criar componentes primitivos sem lógica de negócio
- Criar a rota `/styleguide` para validação visual antes de qualquer página real

## Prompt

```
Leia o CLAUDE.md antes de começar e siga as regras de ritmo de execução.

Inicialize um projeto Next.js 15 com App Router, TypeScript e Tailwind CSS.

Configure o design system a partir dos tokens abaixo:

[COLE AQUI OS TOKENS DO DESIGN SYSTEM EXTRAÍDO]

- Declare cores, tipografia, espaçamentos, raios e sombras como CSS variables
  em globals.css
- Espelhe tudo em tailwind.config.ts para uso via classes utilitárias
- Configure as fontes via next/font, com display swap

Crie os componentes primitivos em /components/ui, todos tipados e sem nenhuma
lógica de negócio:
- Button (variantes primary, secondary, outline e ghost, tamanhos sm, md e lg,
  estados de hover, focus, disabled e loading)
- Input, Textarea, Select, Checkbox
- Badge, Container, Heading, Skeleton

Crie a rota /styleguide renderizando todos os primitivos em todas as variantes
e estados, mais uma amostra da paleta e da escala tipográfica, para eu validar
visualmente antes de seguir.

Não crie nenhuma página de conteúdo, nenhum header, nenhum footer e nenhuma
integração com banco nesta etapa.
```

## Critério de aceite
`/styleguide` abre, a paleta bate com a referência, os botões respondem a hover e foco de teclado.

---

# Etapa 2: Banco de dados e camada de acesso

## Objetivo
Schema criado, segurança configurada e funções de query tipadas prontas para uso.

## Plano de ação
- Migration SQL com as cinco tabelas, índices e Row Level Security
- Policies: leitura pública apenas do que está ativo, escrita só autenticado
- Bucket de Storage para imagens de produto
- Types gerados e funções de query centralizadas

## Prompt

```
Configure o Supabase neste projeto. Antes de escrever, me mostre o plano.

Crie /supabase/migrations/001_schema.sql com as tabelas:

produtos: id uuid pk, nome text, slug text unique, descricao text,
preco_locacao numeric, tamanho text[], cor text, categoria_id uuid fk,
imagens text[], destaque boolean default false, ativo boolean default true,
ordem int default 0, created_at timestamptz default now()

categorias: id uuid pk, nome text, slug text unique, imagem_capa text,
ordem int default 0

cupons: id uuid pk, codigo text unique, influenciadora_nome text,
influenciadora_instagram text, tipo_desconto text check in
('percentual','fixo'), valor numeric, ativo boolean default true,
validade date null, limite_usos int null, usos int default 0,
created_at timestamptz default now()

eventos: id uuid pk, tipo text check in ('visita_produto','cupom_aplicado',
'clique_whatsapp'), produto_id uuid fk null, cupom_id uuid fk null,
created_at timestamptz default now()

configuracoes: chave text pk, valor jsonb

Índices em produtos.slug, produtos.categoria_id, produtos.ativo,
cupons.codigo, eventos.tipo e eventos.created_at.

Habilite RLS em todas as tabelas:
- produtos e categorias: select público quando ativo = true
- cupons: select público apenas das colunas necessárias para validação
- eventos: insert público, select apenas autenticado
- configuracoes: select público, update apenas autenticado
- Todas as demais operações: apenas autenticado

Crie o bucket público "produtos" no Storage, com policy de upload apenas
para autenticados.

Crie /lib/supabase/client.ts e /lib/supabase/server.ts.
Gere os types em /lib/supabase/types.ts.

Crie /lib/queries/ com funções tipadas e documentadas:
getProdutos(filtros), getProdutoBySlug(slug), getProdutosDestaque(),
getProdutosRelacionados(categoriaId, excluirId), getCategorias(),
getCupomByCodigo(codigo), registrarEvento(tipo, produtoId?, cupomId?),
getConfiguracoes()

Crie .env.example com as variáveis necessárias e um seed SQL com 3 categorias
e 6 produtos fictícios para eu conseguir desenvolver as telas seguintes.
```

## Critério de aceite
Migration roda sem erro no Supabase, o seed popula as tabelas e `getProdutos()` retorna os 6 produtos.

---

# Etapa 3: Layout base

## Objetivo
Header, footer e botão de WhatsApp funcionando em todas as rotas.

## Plano de ação
- Header com navegação, transparente sobre o hero e sólido ao rolar
- Menu mobile em drawer lateral
- Footer com dados vindos de `configuracoes`
- Botão flutuante de WhatsApp global

## Prompt

```
Crie o layout base do site. Me mostre o plano antes de escrever.

Header fixo:
- Logo à esquerda
- Navegação central: Home, Acervo, Como Funciona, Perguntas Frequentes, Contato
- Ícones de busca e favoritos à direita
- Fundo transparente quando sobre o hero da home, sólido com sombra sutil
  ao rolar
- Em telas abaixo de 1024px, navegação vira ícone de menu abrindo um drawer
  lateral com transição suave

Footer:
- Logo, endereço, telefone, e-mail
- Coluna de links de navegação
- Ícones de redes sociais
- Linha de direitos autorais
- Dados vindos da tabela configuracoes, com fallback hardcoded caso a
  consulta falhe

Botão flutuante de WhatsApp no canto inferior direito, presente em todas as
rotas exceto /admin e /styleguide.

Aplique tudo em app/layout.tsx. Crie as rotas placeholder de todas as páginas
da navegação com apenas um Heading, para os links não quebrarem.

Respeite prefers-reduced-motion em todas as transições.
```

## Critério de aceite
Navegação funciona em 375px e em desktop, o header muda de estado no scroll, nenhum link leva a 404.

---

# Etapa 4: Home

## Objetivo
Página inicial completa consumindo dados reais do banco.

## Plano de ação
- Hero fullscreen
- Grid de quatro categorias
- Carrossel de destaques
- Bloco de como funciona em seis passos
- Depoimentos
- Faixa de aluguel à distância

## Prompt

```
Construa a home em app/page.tsx como Server Component, com dados vindos do
Supabase. Me mostre o plano antes de escrever.

Seções, nesta ordem:

1. Hero em altura de viewport: imagem de fundo com overlay escuro sutil,
   marca centralizada, chamada curta e botão "Conheça o acervo" apontando
   para /acervo. Imagem com priority e placeholder blur.

2. Grid de 4 categorias em uma linha no desktop e 2x2 no mobile. Cada card
   com imagem de capa, nome em overlay e link "Ver todos". Dados de
   getCategorias(), ordenado por ordem, limite 4.

3. "Queridinhos do momento": carrossel horizontal com os produtos de
   getProdutosDestaque(). Card com imagem em 3:4, nome, categoria e preço
   formatado em BRL. 4 visíveis no desktop, 1.5 no mobile, com arraste
   por toque. Setas apenas no desktop.

4. "Como funciona o nosso closet": 6 passos em grid 3x2 no desktop e
   1 coluna no mobile, cada um com ícone, título e descrição curta.
   Conteúdo em uma constante tipada dentro do arquivo. Os passos são:
   agende sua visita, encontre seu vestido, faça sua reserva, marque os
   ajustes, aproveite a festa, devolva o vestido.

5. Depoimentos: carrossel com foto da cliente, citação, nome e @ do
   Instagram. Conteúdo em constante por enquanto.

6. Faixa de destaque: "Não consegue vir até o ateliê? Alugue à distância
   pelo WhatsApp", com botão abrindo a conversa.

Crie loading.tsx com skeletons correspondentes a cada seção.
Toda imagem via next/image com sizes correto.
Mantenha o carrossel como o único client component da página.
```

## Critério de aceite
A home carrega com os produtos do seed, o carrossel arrasta no celular e o LCP é a imagem do hero.

---

# Etapa 5: Acervo com filtros

## Objetivo
Catálogo navegável com filtros compartilháveis por URL.

## Plano de ação
- Grid denso com sidebar de filtros
- Filtro por categoria, cor, tamanho e faixa de preço
- Estado inteiro na URL
- Carregamento incremental

## Prompt

```
Crie a página /acervo. Me mostre o plano antes de escrever.

Layout: sidebar de filtros à esquerda com 280px, grid de produtos à direita
com 3 colunas no desktop, 2 no tablet e 2 no mobile. Abaixo de 1024px a
sidebar vira um drawer aberto por um botão "Filtrar" fixo no rodapé da tela.

Filtros:
- Categoria: checkbox múltiplo, com contagem de produtos ao lado de cada uma
- Cor: swatches circulares clicáveis, múltipla escolha
- Tamanho: checkbox múltiplo
- Faixa de preço: slider duplo com valores em BRL

Todo o estado dos filtros deve viver na URL como search params. Isso é
requisito, não preferência: o link precisa ser compartilhável pelo WhatsApp
e a página precisa ser indexável. Ao recarregar, os filtros continuam
aplicados.

Barra superior do grid: contagem de resultados, select de ordenação (mais
recentes, menor preço, maior preço) e botão "Limpar filtros" visível apenas
quando houver filtro ativo.

Card de produto: imagem em 3:4, nome, categoria e preço. No hover em desktop,
troca para a segunda imagem do array com transição suave.

Carregamento: botão "Carregar mais" carregando 12 por vez. Sem scroll
infinito automático.

Estado vazio: mensagem explicando que nenhum vestido atende à combinação de
filtros, botão para limpar e botão para falar no WhatsApp.

A filtragem deve acontecer no servidor, dentro de getProdutos(filtros).
Não traga o catálogo inteiro para o cliente.
```

## Critério de aceite
Filtrar por cor e tamanho ao mesmo tempo funciona, a URL reflete os filtros, recarregar a página mantém o estado.

---

# Etapa 6: Página de produto e motor do WhatsApp

## Objetivo
Página de vestido indexável com o botão que gera a conversa.

## Plano de ação
- Galeria com thumbs e zoom
- Bloco de informação e preço
- Função central de montagem da mensagem do WhatsApp
- Registro de evento no clique
- Produtos relacionados e JSON-LD

## Prompt

```
Crie a página /acervo/[slug] como Server Component, com generateStaticParams
e generateMetadata. Me mostre o plano antes de escrever.

Layout em duas colunas no desktop, empilhado no mobile.

Coluna esquerda: galeria com imagem principal em 3:4, thumbs verticais à
esquerda no desktop e horizontais abaixo no mobile. Zoom no hover em desktop.
Navegação por arraste no mobile.

Coluna direita: nome como h1, categoria, preço de locação em destaque,
tamanhos disponíveis como badges, descrição, e o bloco de ação.

Bloco de ação: botão grande "Reservar pelo WhatsApp" em largura total, mais
uma linha de texto abaixo explicando que a reserva é confirmada com 50% do
valor.

Crie /lib/whatsapp.ts com a função montarMensagem(produto, cupom?) que
centraliza toda a lógica de montagem. O número e o template vêm de
configuracoes. Formato padrão da mensagem:

"Olá! Tenho interesse no vestido {nome} ({preco}). Link: {url}"

Nenhum outro arquivo deve montar essa mensagem por conta própria.

Antes de abrir o link, dispare registrarEvento('clique_whatsapp', produto.id,
cupom?.id). O disparo não pode bloquear nem atrasar a abertura do WhatsApp:
use fire and forget e trate falha silenciosamente.

Dispare registrarEvento('visita_produto', produto.id) no carregamento da
página, uma vez por sessão por produto.

Abaixo do fold: seção "Você também vai gostar" com 4 produtos da mesma
categoria via getProdutosRelacionados.

generateMetadata com título no formato "{nome} | Aluguel de Vestidos de
Festa | Lennys Ateliê", descrição a partir da descrição do produto e Open
Graph usando a imagem de capa.

Adicione JSON-LD do tipo Product com name, image, description, offers
(price, priceCurrency BRL, availability) e brand.

Trate slug inexistente com notFound().
```

## Critério de aceite
Clicar no botão abre o WhatsApp com o nome do vestido, o preço e o link corretos, e grava o evento no banco.

---

# Etapa 7: Sistema de cupom de influenciadora

## Objetivo
Link de influenciadora que aplica desconto no site inteiro e rastreia a origem até o clique no WhatsApp.

## Plano de ação
- Captura do parâmetro na URL e persistência em cookie
- Validação contra o banco
- Banner de cupom ativo
- Recálculo de preço em todo componente
- Cupom entrando na mensagem do WhatsApp

## Prompt

```
Implemente o sistema de cupom de influenciadora. Esta etapa mexe em
componentes já existentes, então me mostre o plano com a lista de arquivos
afetados antes de escrever qualquer coisa.

Middleware:
- Capturar o search param ?cupom= em qualquer rota
- Validar contra a tabela cupons: precisa estar ativo, dentro da validade
  quando houver, e abaixo do limite de usos quando houver
- Cupom válido: persistir o código em cookie httpOnly por 30 dias
- Cupom inválido ou inexistente: ignorar em silêncio, sem mensagem de erro
  e sem quebrar a navegação
- Remover o parâmetro da URL depois de capturar, via redirect

Crie um CupomProvider que lê o cookie no servidor e expõe o cupom ativo
para toda a árvore de componentes.

Quando houver cupom ativo:
- Banner fixo no topo, acima do header: "Cupom {CODIGO} de
  {influenciadora_nome} aplicado: {desconto} de desconto", com botão de
  remover que apaga o cookie
- Todo componente que exibe preço passa a mostrar o valor original riscado
  e o valor com desconto ao lado, em destaque
- montarMensagem passa a incluir a linha "Cupom: {CODIGO}"
- registrarEvento('cupom_aplicado', null, cupom.id) uma única vez por sessão

Crie /lib/preco.ts com a função calcularPreco(produto, cupom) retornando
{ original, final, desconto, temDesconto }. Toda exibição de preço no site
passa a usar essa função. Nenhum componente calcula desconto por conta
própria.

Crie também /components/Preco.tsx como o único componente de exibição de
preço do projeto, e substitua todas as ocorrências de preço nas telas já
construídas por ele.

Não incremente o contador de usos no clique do WhatsApp. Esse contador é de
uso confirmado e vai ser atualizado manualmente pelo painel na versão 1.
```

## Critério de aceite
Abrir `/acervo?cupom=TESTE10` mostra o banner, os preços aparecem riscados no acervo e no produto, e a mensagem do WhatsApp inclui o código.

---

# Etapa 8: Autenticação e shell do painel

## Objetivo
Área administrativa protegida com dashboard de resultado.

## Plano de ação
- Login por e-mail e senha
- Middleware protegendo `/admin`
- Shell com sidebar
- Dashboard com números do período

## Prompt

```
Crie a área administrativa. Me mostre o plano antes de escrever.

/admin/login: formulário de e-mail e senha usando Supabase Auth. Sem
cadastro público. O usuário será criado manualmente no painel do Supabase.
Erro de credencial mostra mensagem clara em português, sem termo técnico.

Estenda o middleware existente para proteger todas as rotas /admin exceto
/admin/login, redirecionando para o login quando não houver sessão válida.
Cuidado para não conflitar com a lógica de cupom já implementada no
middleware.

Shell em app/admin/layout.tsx: sidebar fixa com Dashboard, Produtos,
Categorias, Cupons e Configurações, mais nome do usuário e botão de sair no
rodapé da sidebar. Sem o header, o footer e o botão de WhatsApp do site
público. Layout limpo e denso, otimizado para uso repetido, não para
impressionar.

/admin como dashboard, com:
- Quatro cards: produtos ativos, cliques no WhatsApp nos últimos 30 dias,
  visitas a produtos nos últimos 30 dias, e cupom com mais cliques
- Gráfico de linha de cliques no WhatsApp por dia nos últimos 30 dias
- Tabela dos 10 vestidos mais visitados no período, com nome, visitas e
  cliques

Todos os dados vindos da tabela eventos. Crie as queries necessárias em
/lib/queries/analytics.ts.

Se não houver dados no período, mostre estado vazio explicando que os
números aparecem conforme o site recebe visitas, sem gráfico quebrado.
```

## Critério de aceite
Login funciona, acessar `/admin/produtos` sem sessão redireciona para o login, o dashboard mostra números coerentes com os eventos gravados.

---

# Etapa 9: Cadastro de produtos

> Dependencia herdada da Etapa 6: /acervo/[slug] usa
> `dynamicParams = false`, para slug inexistente devolver 404 de verdade
> em vez de 200 com a pagina de erro (soft 404, que o Google indexa).
> O efeito colateral e que `generateStaticParams` so roda no build: uma
> peca cadastrada pelo painel nao fica acessivel ate um novo deploy.
> Resolver aqui — deploy hook da Vercel ao salvar, ou voltar para
> dynamicParams true aceitando o soft 404. Decidir antes de entregar o
> painel para a dona do atelie.

## Objetivo
A tela mais importante do painel. É por ela que o ateliê vai viver.

## Plano de ação
- Listagem com busca, filtro e edição rápida
- Formulário completo
- Upload múltiplo com reordenação
- Compressão de imagem no cliente

## Prompt

```
Crie o cadastro de produtos no painel. Esta é a tela mais crítica do projeto.
Me mostre o plano antes de escrever.

/admin/produtos: tabela com miniatura, nome, categoria, preço, toggle de
ativo, toggle de destaque, e ações de editar e excluir. Os dois toggles são
editáveis direto na tabela, com salvamento imediato e feedback visual.
Acima da tabela: campo de busca por nome e filtro por categoria.
Exclusão pede confirmação em modal, explicando que a ação não pode ser
desfeita.

/admin/produtos/novo e /admin/produtos/[id]: formulário com
- Nome, com slug gerado automaticamente a partir dele e editável
- Descrição em textarea
- Preço de locação, com máscara de moeda em BRL
- Categoria em select
- Cor em select
- Tamanhos em multi-select
- Toggle de ativo e toggle de destaque, cada um com uma linha explicando o
  que significa em linguagem simples

Upload de imagens:
- Área de arrastar e soltar aceitando múltiplos arquivos de uma vez
- Preview em grid, com a primeira marcada visualmente como capa
- Reordenação por arrastar
- Botão de remover em cada imagem
- Comprimir para webp no cliente antes de enviar, com largura máxima de
  1600px e qualidade 82
- Barra de progresso durante o envio
- Ao excluir um produto, apagar também as imagens correspondentes no Storage

Validação com Zod e react-hook-form. Mensagens de erro em português,
explicando o que fazer e não apenas o que está errado. Feedback de sucesso
e falha por toast.

Prioridade absoluta desta tela: quem vai usar é a dona do ateliê, não uma
pessoa técnica. Sem jargão, sem sigla, sem termo em inglês na interface.
Cada campo com label claro. Se um campo puder ser deixado em branco, diga
isso no próprio campo.
```

## Critério de aceite
Cadastrar um vestido novo com cinco fotos, do zero, em menos de dois minutos, sem consultar documentação.

---

# Etapa 10: Cupons, categorias e configurações

## Objetivo
Fechar o painel com a tela que entrega o link pronto para a influenciadora.

## Plano de ação
- Cupons com métrica de desempenho na listagem
- Link e mensagem prontos para envio depois de salvar
- Categorias e configurações

## Prompt

```
Crie as telas de cupons, categorias e configurações. Me mostre o plano antes
de escrever.

/admin/cupons: tabela com código, nome da influenciadora, @ do Instagram,
desconto, status, visitas atribuídas, cliques no WhatsApp atribuídos e usos
confirmados. Ordenável por cliques. Campo de usos confirmados editável
direto na tabela, porque a confirmação de aluguel acontece fora do site.

Formulário de cupom:
- Código, forçando maiúsculas e validando unicidade antes de salvar
- Nome e @ do Instagram da influenciadora
- Tipo de desconto: percentual ou valor fixo
- Valor
- Validade opcional
- Limite de usos opcional
- Toggle de ativo

Depois de salvar, exiba um bloco destacado com:
- O link pronto https://dominio.com.br/acervo?cupom=CODIGO com botão de copiar
- Uma mensagem pronta para enviar à influenciadora, também com botão de
  copiar, no formato: "Oi {nome}! Esse é o seu link exclusivo do Lennys
  Ateliê: {link}. Quem entrar por ele ganha {desconto} de desconto em
  qualquer vestido do acervo."

Esse bloco é o entregável real da tela. Dê a ele o destaque visual que ele
merece, não esconda no rodapé.

/admin/categorias: tabela simples com nome, slug, imagem de capa,
quantidade de produtos e ordem reordenável por arrastar. Formulário com
nome, slug, imagem de capa e ordem. Impedir exclusão de categoria que tenha
produtos vinculados, explicando o motivo.

/admin/configuracoes: formulário editando a tabela configuracoes, com número
do WhatsApp, template da mensagem, endereço, telefone, e-mail e links de
redes sociais. No campo de template, mostre quais variáveis estão
disponíveis e um preview em tempo real da mensagem montada com um produto
de exemplo.
```

## Critério de aceite
Criar um cupom, copiar o link, abrir em aba anônima e ver o desconto aplicado no acervo inteiro.

---

# Etapa 11: SEO, performance e entrega

> Pendencia herdada da Etapa 7: o cupom vive em cookie httpOnly lido no
> servidor, e `cookies()` e API dinamica no Next — entao o site inteiro
> voltou a ser server-rendered on demand, perdendo a geracao estatica com
> revalidacao de 1h que a Etapa 4 tinha conquistado. Alternativa, se o custo
> incomodar: manter as paginas estaticas e aplicar o cupom no cliente, aceitando
> um piscar do preco cheio antes do desconto. Decidir aqui.


> Pendencia herdada da Etapa 1: o projeto esta fixado no Next 15.5.23 e o
> `npm audit` acusa 3 avisos high (postcss e sharp embutidos no Next 15),
> sem correcao disponivel na linha 15.x. O unico caminho e subir para o
> Next 16. Decidir aqui, junto com a auditoria final. O do sharp e o que
> importa, porque o next/image processa as fotos de produto.

## Objetivo
Site pronto para produção e documentado para quem vai operar.

## Plano de ação
- Metadata, sitemap, robots e dados estruturados
- Auditoria de imagens e client components
- Acessibilidade
- Documentação de deploy e manual de uso

## Prompt

```
Finalize o projeto para produção. Me mostre o plano antes de executar.

SEO:
- generateMetadata em todas as rotas públicas, com título e descrição
  próprios
- Open Graph e Twitter Card em todas elas
- sitemap.ts dinâmico incluindo home, acervo, páginas institucionais e
  todos os produtos ativos
- robots.ts bloqueando /admin e /styleguide
- JSON-LD de LocalBusiness na home com nome, endereço, telefone e horário
- Canonical em todas as páginas, garantindo que os filtros do acervo não
  gerem conteúdo duplicado

Performance:
- Audite toda imagem: sizes correto, priority apenas no hero, placeholder
  blur onde fizer sentido
- Liste todo componente marcado como "use client" e converta para Server
  Component o que não precisar ser cliente
- Meta: LCP abaixo de 2.5s e CLS abaixo de 0.1 no mobile

Acessibilidade:
- Contraste mínimo AA em todo texto
- Foco de teclado visível em todo elemento interativo
- Label associado a todo input
- Alt descritivo em toda imagem de produto
- Navegação completa por teclado no menu e nos filtros

Documentação:
- DEPLOY.md com o passo a passo de configurar a Vercel, as variáveis de
  ambiente e como criar o usuário administrador no Supabase
- MANUAL.md em português simples, escrito para a dona do ateliê, cobrindo:
  como entrar no painel, como cadastrar um vestido novo, como colocar um
  vestido em destaque, como criar um cupom e enviar para a influenciadora,
  e como ler os números do dashboard

Ao final, rode uma auditoria e me apresente o que ficou abaixo da meta, com
a lista do que ainda precisa ser corrigido.
```

## Critério de aceite
Lighthouse mobile acima de 90 em Performance e SEO, e o MANUAL.md compreensível para alguém sem conhecimento técnico.

---

# Checklist de progresso

| Etapa | Descrição | Status |
|---|---|---|
| 0 | CLAUDE.md criado na raiz | [x] |
| 1 | Fundação e design system | [x] |
| 2 | Banco de dados e queries | [x] |
| 3 | Layout base | [x] |
| 4 | Home | [x] |
| 5 | Acervo com filtros | [x] |
| 6 | Produto e motor do WhatsApp | [x] |
| 7 | Sistema de cupom | [x] |
| 8 | Autenticação e dashboard | [x] |
| 9 | Cadastro de produtos | [x] |
| 10 | Cupons, categorias e configurações | [~] |
| 11 | SEO, performance e entrega | [x] |

---

# Versão 2, fora do escopo atual

Registrado aqui para não virar pedido informal no meio da execução.

- Calendário de disponibilidade por vestido com bloqueio de datas
- Reserva com pagamento de sinal online
- Lista de favoritos persistente com conta de cliente
- Fila de espera para vestido já reservado na data desejada
- Envio automático de mensagem de devolução no dia seguinte ao evento
- Relatório mensal por e-mail para a dona do ateliê
