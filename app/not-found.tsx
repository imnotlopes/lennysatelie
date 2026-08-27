import Link from "next/link";
import { Container, Heading } from "@/components/ui";

/**
 * Página 404 do site.
 *
 * Substitui a padrão do Next, que vem em inglês. Em vez de só avisar do erro,
 * devolve a cliente para o acervo — é de lá que sai a conversa.
 */
export default function NaoEncontrada() {
  return (
    <Container
      as="main"
      className="flex flex-1 flex-col items-start justify-center gap-4 py-24"
    >
      <Heading as={1} size="display-md">
        Não achamos essa página
      </Heading>
      <p className="max-w-prose text-sm leading-base text-ink-muted">
        O endereço pode ter mudado, ou a peça saiu do acervo. Veja os vestidos
        disponíveis agora.
      </p>
      <Link
        href="/acervo"
        className="border border-accent bg-accent px-6 py-3 text-xs tracking-caps uppercase text-ink transition-colors duration-200 ease-brand hover:bg-transparent hover:text-accent-ink"
      >
        Ver o acervo
      </Link>
    </Container>
  );
}
