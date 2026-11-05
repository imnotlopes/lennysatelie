import Script from "next/script";

/**
 * Pixel da Meta, para medir o tráfego pago.
 *
 * ONDE ELE ENTRA, E ONDE NÃO ENTRA
 * --------------------------------
 * Monta no site público (`app/(site)/layout.tsx`) e na página de links
 * (`app/(links)/links/page.tsx`), que é onde o anúncio deixa a visitante.
 *
 * NÃO monta no painel. Se montasse, cada vez que a Lennys abrisse uma tela
 * para cadastrar vestido viraria evento de visita, e os números da campanha
 * passariam a contar o trabalho dela junto com o público de verdade.
 *
 * POR QUE O ID VEM DO AMBIENTE
 * ----------------------------
 * Não é segredo: o ID aparece no HTML de qualquer jeito, qualquer visitante
 * consegue lê-lo. Está em variável por dois motivos práticos. Sem a variável
 * o pixel simplesmente não carrega, então o ambiente de desenvolvimento não
 * polui os dados da conta. E trocar de conta de anúncios depois não exige
 * mexer em código.
 *
 * `afterInteractive` e não `beforeInteractive`: o pixel não precisa existir
 * antes da página pintar, e carregá-lo cedo demais atrasaria o que a
 * visitante veio ver.
 *
 * PENDÊNCIA COMBINADA COM O EDSON
 * -------------------------------
 * Falta o banner de consentimento. A ANPD entende que cookie de publicidade
 * pede consentimento, e o `_fbp` que este pixel grava é de publicidade. Ficou
 * para uma etapa separada, decidido em 05/11/2026. Quando vier, o lugar de
 * mexer é aqui: o componente passa a só renderizar depois do aceite.
 */
const ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function PixelMeta() {
  if (!ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${ID}');
fbq('track', 'PageView');`}
      </Script>

      {/* Caminho sem JavaScript. É uma imagem de 1x1 que o próprio Meta
          serve, então não passa pelo otimizador do Next nem faz sentido
          virar `next/image`. */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
