# Onde colocar as fotos do ateliê

Três pastas, uma por categoria do site:

```
imagens-atelie/
  casamento-civil/   <- comece por esta
  noiva/
  festa/
```

Coloque os arquivos originais aqui, do jeito que saíram da câmera ou do
celular. Não precisa redimensionar nem converter: eu faço isso na hora de
subir (webp, 1600px de largura, qualidade 82).

---

## Como nomear os arquivos

**Isto é o que faz a foto encontrar o vestido certo.** Use o endereço da peça
no site, seguido do número da foto:

```
vestido-naely-1.jpg      <- vira a CAPA
vestido-naely-2.jpg
vestido-naely-3.jpg
vestido-steline-1.jpg
vestidos-de-cartorio-1.jpg
```

O número 1 é sempre a capa: é a foto que aparece na grade do acervo e quando
alguém compartilha o link no WhatsApp. Escolha a melhor para ela.

Aceita `.jpg`, `.jpeg`, `.png` e `.webp`.

## Os endereços de cada peça

Estão na coluna "Endereço" do painel, em Vestidos. São sempre o nome em
minúsculas, sem acento, com hífen no lugar do espaço:

| Nome no catálogo | Nome do arquivo |
|---|---|
| Vestido Naely | `vestido-naely-1.jpg` |
| Vestido Alana Noiva | `vestido-alana-noiva-1.jpg` |
| Vestido Anastácia | `vestido-anastacia-1.jpg` |
| Vestidos de cartório | `vestidos-de-cartorio-1.jpg` |

Se errar o nome, eu aviso qual arquivo não achou dono — nada se perde.

## Se preferir não nomear

Pode jogar as fotos na pasta com o nome que vierem. Nesse caso me diga, que eu
subo pelo painel peça por peça — leva mais tempo, mas funciona igual.

---

**Esta pasta não vai para o site.** É só o ponto de partida: daqui as fotos vão
para o Storage do Supabase, comprimidas, e é de lá que o site as serve.
