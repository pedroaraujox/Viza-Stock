// Tipos principais do sistema
export interface Produto {
  id: string
  nome: string
  desc: string
  tipo: 'MATERIA_PRIMA' | 'PRODUTO_ACABADO'
  unidadeMedida: string
  quantidadeEmEstoque: number
  // Limites opcionais para controle de alertas de estoque
  estoqueMinimo?: number
  estoqueRecomendado?: number
}

export interface FichaTecnica {
  id: string
  produtoAcabado: Produto
  componentes: FichaTecnicaComponente[]
}

export interface FichaTecnicaComponente {
  id: number
  materiaPrima: Produto
  quantidade: number
}

// DTOs para requisições
export interface ProdutoRequestDTO {
  // ID agora é opcional: quando não informado, o backend gera automaticamente um ID único
  id?: string
  nome: string
  desc?: string
  tipo: 'MATERIA_PRIMA' | 'PRODUTO_ACABADO'
  unidadeMedida: string
}

export interface ProdutoEntradaDTO {
  produtoId: string
  quantidade: number
}

export interface ProdutoAcabadoRequestDTO {
  id?: string
  nome: string
  desc?: string
  unidadeMedida: string
  componentes: ComponenteDTO[]
  // Campos adicionais para controle de estoque
  // Opcionalmente informados no cadastro de Produto Acabado
  estoqueMinimo?: number
  estoqueRecomendado?: number
}

export interface ComponenteDTO {
  materiaPrimaId: string
  quantidade: number
}

export interface OrdemProducaoRequestDTO {
  produtoAcabadoId: string
  quantidadeAProduzir: number
}

// Tipos para UI
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  // Indica se a notificação já foi visualizada
  read: boolean
}

export interface DashboardMetrics {
  totalProdutos: number
  produtosEstoqueBaixo: number
  producaoDiaria: number
  valorTotalEstoque: number
  // Campos opcionais adicionais usados em alguns gráficos/cards
  crescimentoProdutos?: number
  crescimentoEstoque?: number
  crescimentoProducao?: number
  crescimentoValor?: number
  alertasEstoque?: number
  ordensProducao?: number
}

export interface MovimentacaoEstoque {
  id: string
  produtoId: string
  produtoNome: string
  tipo: 'ENTRADA' | 'SAIDA' | 'PRODUCAO'
  quantidade: number
  data: Date
  observacao?: string
}

export interface OrdemProducao {
  id: string
  produtoAcabadoId: string
  produtoNome: string
  quantidadeProduzida: number
  dataExecucao: Date
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'EXECUTADA' | 'CANCELADA'
}

// Tipos para filtros e paginação
export interface FiltrosProdutos {
  tipo?: 'MATERIA_PRIMA' | 'PRODUTO_ACABADO'
  busca?: string
  ordenacao?: 'nome' | 'estoque' | 'tipo'
  direcao?: 'asc' | 'desc'
}

export interface Paginacao {
  pagina: number
  itensPorPagina: number
  total: number
}