# Design System de Referência — Free People (freepeople.com)

> Extraído em 21/08/2026 dos arquivos em `referencia/` + inspeção dos estilos computados
> no site ao vivo (o HTML salvo não trouxe o CSS externo).
> Fonte dos tokens: `static.freepeople.com/static/v3/assets/index-*.css` — 435 custom properties.

---

## 1. Fundação

**`html { font-size: 10px }`** — a escala inteira é rem sobre base 10.
`1.2rem = 12px`, `1.4rem = 14px`, `2.1rem = 21px`. Facilita a leitura dos valores.

### Breakpoints (por frequência de uso no CSS)

| Faixa | Media query | Ocorrências |
|---|---|---|
| Mobile → Tablet | `767px` / `768px` | 97 |
| Tablet → Desktop | `1024px` / `1025px` | 116 |
| Wide | `1441px` | 6 |
| Secundários | `568px`, `896px` | 15 |

Sistema **mobile-first de 3 faixas**: `< 768` · `768–1024` · `≥ 1025`.

---

## 2. Cor

### 2.1 Primitivas (armazenadas como triplas RGB para permitir alpha)

| Token | RGB | HEX | Papel |
|---|---|---|---|
| `--creme-light` | `254, 251, 250` | `#FEFBFA` | **Fundo do site** |
| `--creme` | `250, 242, 237` | `#FAF2ED` | Fundo secundário, hover de dropdown |
| `--creme-dark` | `237, 230, 224` | `#EDE6E0` | Bordas, separadores, tooltip |
| `--ivory-light` | `252, 247, 242` | `#FCF7F2` | Input de chat |
| `--white` | `255, 255, 255` | `#FFFFFF` | Cards, modais, dropdowns |
| `--stone-dark` | `37, 36, 35` | `#252423` | **Texto principal** (não é preto puro) |
| `--stone-medium` | `124, 112, 110` | `#7C706E` | Placeholder |
| `--stone` | `153, 143, 138` | `#998F8A` | Preço original riscado |
| `--stone-light` | `214, 208, 203` | `#D6D0CB` | Bordas de input, estado disabled |
| `--pink-dark` | `213, 41, 117` | `#D52975` | **Acento da marca / ação** |
| `--pink` | `255, 175, 175` | `#FFAFAF` | Badges, loader |
| `--green` | `5, 117, 85` | `#057555` | Confirmação |
| `--red` | `208, 19, 2` | `#D01302` | Erro |
| `--black` | `0, 0, 0` | `#000000` | Contraste de controles |

**A paleta inteira são 5 famílias**: creme (fundos), stone (texto/bordas), pink (ação),
green (sucesso), red (erro). Nada além disso.

### 2.2 Camada semântica

As 435 variáveis nunca usam cor literal — todas apontam para as primitivas:

```css
--site-background:           rgb(var(--creme-light));
--site-background-secondary: rgb(var(--creme));
--text-dark:                 rgb(var(--stone-dark));
--text-medium:               rgb(var(--stone-dark));
--text-light:                rgb(var(--white));
--border-default:            rgb(var(--creme-dark));
--separator:                 rgb(var(--creme-dark));
--link-text:                 rgb(var(--stone-dark));
--link-text-selected:        rgb(var(--pink-dark));
--focus-ring:                rgb(var(--pink-dark));
--price-sale:                rgb(var(--pink-dark));
--price-original:            rgb(var(--stone));
```

**Regra de ouro do sistema:** tudo é stone-dark em repouso e **vira `--pink-dark` no hover/foco/selecionado**.
É o único acento — é ele que dá identidade ao site.

---

## 3. Tipografia

### 3.1 Famílias

```css
--font-body:      'Karla', Helvetica, sans-serif;
--font-heading:   'Karla', Georgia, serif;   /* aponta pra mesma família */
--font-body-bold: 700;
```

**Uma única fonte web carregada: Karla**, em 2 pesos (400 e 700), subset latin,
`woff2` com fallback `ttf`, `font-display: swap`, ambos com `<link rel="preload">`.

> ⚠️ Observação importante: o serifado display dos banners editoriais
> ("MEET THE OPAL FAMILY", "THE SALE SHOP") **não é fonte — está embutido na imagem**.
> `document.fonts` retorna apenas `["Karla"]`. Ver §8 para a decisão no site da Lennys.

### 3.2 Escala real (medida nos elementos renderizados)

| px | rem | Peso | letter-spacing | line-height | Uso |
|---|---|---|---|---|---|
| 11 | 1.1 | 400 | 0.3px | normal | Legendas ("US Only") |
| **12** | 1.2 | 400 | 0.3px | normal | **Corpo, nav, breadcrumb, preço na grade, labels** — o tamanho mais usado (103 ocorrências) |
| 12 | 1.2 | 400 | **1.2px** | normal | **Botões** (uppercase) |
| 12 | 1.2 | **700** | 0.3px | 20.4px | Rótulos de seção ("Browse by:"), destaque de banner |
| **14** | 1.4 | 400 | 0.3px | **23.8px (1.7)** | **Título de produto na grade** (68 ocorrências) |
| 14 | 1.4 | 400 | 0.6px | normal | Cabeçalho de acordeão, filtros |
| 18 | 1.8 | 400 | 0.3px | normal | Preço na página de produto, subtítulo de seção |
| **21** | 2.1 | 400 | 0.3px | normal | **`h1`** — título de categoria e nome do produto |

**Só existem 5 tamanhos e 2 pesos.** O `h1` tem 21px — não há tipografia grande
em texto real; o impacto visual vem inteiramente das fotos.

**`letter-spacing` é assinatura do sistema:**

- `0.3px` — padrão universal
- `0.6px` — acordeões e navegação secundária
- `1.2px` — botões e qualquer coisa em uppercase

**`text-transform: uppercase`** só aparece em botões (`12px / ls 1.2px / w400`).

---

## 4. Geometria e profundidade

```css
border-radius: 0;   /* botões, inputs, tiles, cards, seletor de tamanho, modais */
```

**Cantos vivos em todo o sistema.** A única exceção é o swatch de cor: círculo de 36px
(`border-radius: 50%` — 324 ocorrências, praticamente todas swatches e ícones).

- Bordas: sempre **1px solid**
- Sombras: `--box-shadow: rgba(204,204,204,.15)` e `--drop-shadow: rgba(0,0,0,.1)` existem
  mas são quase não usadas. **O sistema é flat.**
- Overlays: `rgba(var(--creme), .8)` para modal, `rgba(var(--creme), .9)` para navegação —
  o overlay é creme, não preto.

---

## 5. Espaçamento

Escala observada por frequência de uso:

| Valor | Ocorrências | Uso típico |
|---|---|---|
| **10px** | 146 | Unidade base — padding interno, gaps pequenos |
| **20px** | 61 | Gutter de grade, padding de botão, padding lateral mobile |
| 5px | 33 | Micro-ajustes, gap da grade em mobile |
| 15px | 26 | Padding vertical de nav |
| 30px | 9 | Margem inferior do tile de produto |
| 60px | 18 | Respiro entre seções, gutter lateral do desktop |

**Escala base 5**, com 10 e 20 fazendo o trabalho pesado: `5 · 10 · 15 · 20 · 30 · 60`.

---

## 6. Layout

### 6.1 Container

- `main` ocupa **1265px**, conteúdo interno em **1145px** → gutter de ~60px de cada lado
- Não há `max-width` fixo no `main`: o conteúdo é fluido e os banners editoriais são **full-bleed**

### 6.2 Grade de produtos

```css
.c-pwa-tile-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* desktop */
  column-gap: 20px;
  row-gap: normal;                        /* espaçamento vertical vem do tile */
}
.c-pwa-tile-grid-tile { margin-bottom: 30px; }
```

- Desktop: **3 colunas**, gap 20px
- Mobile (`≤767px`): **2 colunas**, `grid-column-gap: 5px`
- O tile não tem borda, fundo nem padding — é imagem + texto solto sobre o creme

### 6.3 Página de produto (PDP)

```
grid-template-columns: 629.75px 451.125px;   /* ≈ 58% / 42% */
gap: 5.6%;
width: 1145px;
```

Galeria à esquerda, buy box à direita.

### 6.4 Header

`position: sticky`, altura de 147px (listagem) a 207px (PDP, com breadcrumb).
Três faixas empilhadas: utility bar → logo + nav principal → subnav de categoria.
Fundo transparente sobre o creme do site, separado por `border-bottom: 1px solid var(--creme-dark)`.

---

## 7. Componentes

### Botão primário

```css
background: rgb(var(--pink-dark));  color: #fff;
border: 1px solid rgb(var(--pink-dark));  border-radius: 0;
height: 45px;  padding: 10px 20px;
font: 400 12px/normal Karla;  letter-spacing: 1.2px;  text-transform: uppercase;
transition: color .2s, background-color .2s, border-color .2s;

/* hover: inverte */
background: transparent;  color: rgb(var(--pink-dark));
```

### Botão secundário

Espelho invertido: transparente com borda e texto pink-dark; no hover **preenche** de pink-dark
com texto branco.

### Estado disabled

`background: stone-light` · `color: stone-dark` · `border: stone-light`

### Seletor de tamanho

Quadrado **38×38px**, `border: 1px solid stone-light`, radius 0, texto 12px.
Selecionado → borda `stone-dark`. Indisponível → traço diagonal (`--radio-styled-slash`).

### Swatch de cor

Círculo **36px**, `border: 1px solid stone-light`; selecionado → `stone-dark`; hover → `pink-dark`.

### Tile de produto

Imagem **2:3** (nativa 246×368, servida em 368×552) → título 14px/1.7 → preço 12px → "15 colors" 12px.
Sem card, sem borda, sem sombra.

### Preço

- Normal: `stone-dark`, 12px na grade / 18px na PDP
- Promoção: `pink-dark`
- Original riscado: `stone` (#998F8A)

### Transições

```css
.15s cubic-bezier(0.645, 0.045, 0.355, 1)   /* micro-interações */
.2s                                          /* botões */
.3s cubic-bezier(0.4, 0, 0.2, 1)             /* elementos maiores */
```

---

## 8. Leitura estratégica — o que replicar para a Lennys

### O que faz este design funcionar

1. **O fundo não é branco.** É `#FEFBFA` (creme quentíssimo). O site inteiro flutua num
   tom de papel, e as fotos de produto têm fundo no mesmo creme — a página parece contínua,
   sem "caixas" de produto.
2. **Tipografia deliberadamente pequena e discreta.** `h1` de 21px. O texto se apaga
   para a foto aparecer. Numa loja de roupa, o produto é a imagem.
3. **Um único acento.** Tudo é stone-dark; hover vira pink-dark. Zero ambiguidade.
4. **Cantos vivos + flat.** Nenhum radius, nenhuma sombra. É o que separa "atelier"
   de "template de e-commerce".
5. **Grade sem molduras.** Imagem 2:3 encostada na vizinha com 20px de respiro.
6. **`letter-spacing` em tudo.** 0.3px é sutil, mas é o que dá o ar editorial.

### As 2 decisões que precisam ser tomadas para a Lennys

| # | Decisão | Contexto |
|---|---|---|
| **1** | **Cor de acento** | O `#D52975` (rosa-choque) é a assinatura da Free People, não serve para a Lennys. Toda a estrutura de tokens (`--link-*-hover`, `--button-primary-*`, `--focus-ring`, `--price-sale`) troca em um só lugar. Precisa da paleta/identidade da Lennys. |
| **2** | **Fonte de display** | A Free People resolve os títulos editoriais colocando serifada dentro da imagem — funciona para quem tem estúdio de fotografia. Para a Lennys eu recomendaria adicionar **uma serifada real de display** (Cormorant Garamond, Marcellus ou Playfair) para os títulos, mantendo a sans (Karla ou similar) para toda a UI. Entrega o mesmo ar de ateliê sem depender de arte embutida em imagem. |

### O que **não** replicar

- A quantidade de tokens (435). Para a Lennys, ~50 tokens semânticos cobrem tudo.
- A altura do header (207px em 3 faixas) — excesso de e-commerce grande.
- `html { font-size: 10px }` é conveniente, mas atrapalha o zoom acessível do navegador
  em alguns casos; prefiro manter 16px e usar `rem` normalmente.

---

## 9. Arquivos de referência

| Arquivo | Conteúdo |
|---|---|
| `referencia/fp-listagem.html` | Página de categoria "Sweaters" (884 KB) |
| `referencia/fp-produto.html` | PDP "Thistle Hooded Cardi" (412 KB) |
| `referencia/fp-snapshot-home.jpg` | Captura de página inteira da home |
| `tokens.css` | Tokens traduzidos e prontos para reskin |
