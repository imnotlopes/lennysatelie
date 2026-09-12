export {
  getAcervo,
  getProdutos,
  getProdutoBySlug,
  getProdutosDestaque,
  getProdutosRelacionados,
  getProdutoSlugs,
  getProdutosPorSlugs,
} from "./produtos";
export type { OrdenacaoProduto, ProdutoFiltros } from "./produtos";

export { getCategorias, getCategoriaBySlug } from "./categorias";

export { getFacetas } from "./facetas";
export type { Facetas, OpcaoFaceta } from "./facetas";

export { getCupomByCodigo } from "./cupons";
export { getCupomAtivo } from "./cupom-ativo";
export { getMidias, getTodasMidias } from "./midias";
export { getLinks, getDepoimentos, getLinksDoPainel } from "./links";
export type { LinkComCliques } from "./links";
export { getEtiquetas, getEtiquetasComUso } from "./etiquetas";
export type { EtiquetaComUso } from "./etiquetas";

export { registrarEvento } from "./eventos";

export { getConfiguracoes } from "./configuracoes";
export type { Configuracoes, Contato, WhatsappTemplate } from "./configuracoes";
