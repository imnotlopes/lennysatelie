import { MosaicoDepoimentos } from "@/components/secoes/mosaico-depoimentos";
import { Container, Heading } from "@/components/ui";
import { getMidias } from "@/lib/queries";

/**
 * Os depoimentos das clientes, numa seção só.
 *
 * Antes eram duas na home, e com a seção de vídeos no meio: um trilho
 * horizontal de stories e, três telas abaixo, uma parede de prints de WhatsApp
 * em fundo bege. Mesmo assunto, dois formatos, separados por outro. Ficou
 * bagunçado, e era.
 *
 * Agora é um mosaico só, que se reveza pelos dezenove depoimentos em vez de
 * empilhar todos. O tamanho de cada lugar segue o conteúdo — ver
 * `MosaicoDepoimentos`.
 */
export async function Feedbacks() {
  const [mensagens, fotos] = await Promise.all([
    getMidias("feedback_mensagem"),
    getMidias("feedback_imagem"),
  ]);

  if (!mensagens.length && !fotos.length) return null;

  return (
    <div>
      <Container as="section" className="folha gap-6">
        <div className="flex flex-col gap-2">
          <Heading
            as={2}
            size="display-sm"
            revelar
            rotulo="Quem já vestiu"
            filete
          >
            O que elas dizem depois
          </Heading>
          <p className="max-w-prose text-xs text-ink-muted">
            Mensagens que chegaram no WhatsApp do ateliê e publicações do nosso
            Instagram, com autorização de cada cliente.
          </p>
        </div>

        <MosaicoDepoimentos mensagens={mensagens} fotos={fotos} />
      </Container>
    </div>
  );
}
