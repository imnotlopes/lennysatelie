import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  ProductTileSkeleton,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";
import type { ButtonSize, ButtonVariant } from "@/components/ui";

export const metadata: Metadata = {
  title: "Styleguide | Lennys Ateliê",
  robots: { index: false, follow: false },
};

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "outline", "ghost"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

const PALETTE = [
  { token: "surface", hex: "#FEFBFA", nome: "Fundo do site" },
  { token: "surface-alt", hex: "#FAF2ED", nome: "Fundo secundário" },
  { token: "surface-raised", hex: "#FFFFFF", nome: "Card, modal" },
  { token: "line", hex: "#EDE6E0", nome: "Borda, separador" },
  { token: "line-strong", hex: "#D6D0CB", nome: "Borda de campo" },
  { token: "ink", hex: "#252423", nome: "Texto principal" },
  { token: "ink-muted", hex: "#7C706E", nome: "Texto de apoio" },
  { token: "ink-faded", hex: "#998F8A", nome: "Preço riscado" },
  { token: "accent", hex: "#D52975", nome: "Ação (placeholder)" },
  { token: "accent-soft", hex: "#FFAFAF", nome: "Etiqueta, loader" },
  { token: "success", hex: "#057555", nome: "Confirmação" },
  { token: "error", hex: "#D01302", nome: "Erro" },
];

const TYPE_SCALE = [
  { classe: "text-display-lg", px: "56px", fonte: "Marcellus" },
  { classe: "text-display-md", px: "40px", fonte: "Marcellus" },
  { classe: "text-display-sm", px: "28px", fonte: "Marcellus" },
  { classe: "text-xl", px: "21px", fonte: "Karla" },
  { classe: "text-lg", px: "18px", fonte: "Karla" },
  { classe: "text-base", px: "16px", fonte: "Karla" },
  { classe: "text-sm", px: "14px", fonte: "Karla" },
  { classe: "text-xs", px: "12px", fonte: "Karla" },
  { classe: "text-2xs", px: "11px", fonte: "Karla" },
];

const SPACING = [
  { classe: "1", px: "5px" },
  { classe: "2", px: "10px" },
  { classe: "3", px: "15px" },
  { classe: "4", px: "20px" },
  { classe: "6", px: "30px" },
  { classe: "12", px: "60px" },
];

const TAMANHOS = [
  { value: "pp", label: "PP" },
  { value: "p", label: "P" },
  { value: "m", label: "M" },
  { value: "g", label: "G" },
  { value: "gg", label: "GG", disabled: true },
];

export default function StyleguidePage() {
  return (
    <Container as="main" className="flex flex-col gap-12 py-12">
      <header className="flex flex-col gap-2">
        <Heading as={1} size="display-md">
          Styleguide
        </Heading>
        <p className="max-w-prose text-sm text-ink-muted">
          Página de validação visual do design system. Não faz parte do site e
          não é indexada. O acento está com a cor da referência como
          placeholder, até a identidade da Lennys ser definida.
        </p>
      </header>

      <Secao titulo="Paleta">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE.map((cor) => (
            <div key={cor.token} className="flex flex-col gap-2">
              <div
                className="h-12 w-full border border-line"
                style={{ backgroundColor: cor.hex }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-ink">{cor.token}</span>
                <span className="text-2xs text-ink-muted">
                  {cor.hex} · {cor.nome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Escala tipográfica">
        <div className="flex flex-col gap-4">
          {TYPE_SCALE.map((linha) => (
            <div
              key={linha.classe}
              className="flex flex-col gap-1 border-b border-line pb-4 last:border-0"
            >
              <span className="text-2xs text-ink-muted">
                {linha.classe} · {linha.px} · {linha.fonte}
              </span>
              <span
                className={`${linha.classe} ${
                  linha.fonte === "Marcellus" ? "font-display" : "font-sans"
                } text-ink`}
              >
                Vestido de tule bordado
              </span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Títulos">
        <div className="flex flex-col gap-4">
          <Heading as={1} size="display-lg">
            Ateliê de vestidos de festa
          </Heading>
          <Heading as={2} size="display-sm">
            Acervo da estação
          </Heading>
          <Heading as={3} size="xl">
            Vestido Thistle bordado
          </Heading>
          <Heading as={4} size="sm">
            Detalhes da peça
          </Heading>
        </div>
      </Secao>

      <Secao titulo="Espaçamento">
        <p className="text-2xs text-ink-muted">
          Base de 5px. Cada unidade Tailwind vale 5px, então a escala da
          referência sai direto das classes utilitárias.
        </p>
        <div className="flex flex-col gap-2">
          {SPACING.map((passo) => (
            <div key={passo.classe} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-2xs text-ink-muted">
                p-{passo.classe} · {passo.px}
              </span>
              <div
                className="h-3 bg-accent-soft"
                style={{ width: passo.px }}
              />
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Botões">
        <div className="flex flex-col gap-6">
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-col gap-3">
              <span className="text-2xs tracking-caps uppercase text-ink-muted">
                {variant}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {SIZES.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    Falar no WhatsApp
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  Desabilitado
                </Button>
                <Button variant={variant} loading>
                  Carregando
                </Button>
              </div>
            </div>
          ))}
          <p className="text-2xs text-ink-muted">
            Navegue com Tab para conferir o anel de foco em cada variante.
          </p>
        </div>
      </Secao>

      <Secao titulo="Etiquetas">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Novidade</Badge>
          <Badge variant="accent">Mais alugado</Badge>
          <Badge variant="success">Disponível</Badge>
          <Badge variant="error">Reservado</Badge>
        </div>
      </Secao>

      <Secao titulo="Campos">
        <div className="grid gap-6 md:grid-cols-2">
          <Input id="sg-nome" label="Nome" placeholder="Como podemos te chamar" />
          <Input
            id="sg-whatsapp"
            label="WhatsApp"
            placeholder="(00) 00000-0000"
            hint="Usamos apenas para responder sobre a peça."
          />
          <Input
            id="sg-email"
            label="E-mail"
            defaultValue="endereco-invalido"
            error="Digite um e-mail com @ e domínio."
          />
          <Input
            id="sg-bloqueado"
            label="Campo bloqueado"
            defaultValue="Não editável"
            disabled
          />
          <Select
            id="sg-tamanho"
            label="Tamanho"
            placeholder="Todos os tamanhos"
            options={TAMANHOS}
          />
          <Select
            id="sg-tamanho-erro"
            label="Tamanho"
            placeholder="Todos os tamanhos"
            options={TAMANHOS}
            error="Escolha um tamanho para continuar."
          />
          <Textarea
            id="sg-mensagem"
            label="Mensagem"
            placeholder="Conte para qual ocasião é o vestido"
            wrapperClassName="md:col-span-2"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Checkbox id="sg-bordado" label="Bordado" defaultChecked />
          <Checkbox id="sg-liso" label="Liso" />
          <Checkbox id="sg-tule" label="Tule" disabled />
          <Checkbox
            id="sg-termos"
            label="Aceito ser contatada pelo WhatsApp"
            error="Marque para enviarmos a resposta."
          />
        </div>
      </Secao>

      <Secao titulo="Carregamento">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ProductTileSkeleton />
          <ProductTileSkeleton />
          <ProductTileSkeleton />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </Secao>
    </Container>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6">
      <Heading as={2} size="xl">
        {titulo}
      </Heading>
      {children}
    </section>
  );
}
