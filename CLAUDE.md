@AGENTS.md

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

---

## Stack fixada
Next.js 15 (App Router) · TypeScript estrito · Tailwind CSS v4 · Supabase · Vercel.

Tailwind v4 não usa `tailwind.config.ts`. Os tokens ficam em `@theme` dentro de
`app/globals.css` e viram classes utilitárias a partir dali. Fonte única de verdade.

## Referências do projeto
- `DESIGN-SYSTEM.md` — design system extraído do site de referência (Free People)
- `tokens.css` — tokens de origem, já enxugados
- `lennys-atelie-prompts.md` — plano de execução em 11 etapas
- `referencia/` — HTML e capturas do site de referência

## Pendências de identidade
- `--accent` está com o rosa da referência (#D52975) como **placeholder**.
  Trocar quando a identidade da Lennys estiver definida. Muda em um lugar só.
