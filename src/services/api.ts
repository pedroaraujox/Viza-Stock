import axios from 'axios'
import type { AxiosError } from 'axios'
import type {
  Produto,
  ProdutoRequestDTO,
  ProdutoEntradaDTO,
  ProdutoAcabadoRequestDTO,
  OrdemProducaoRequestDTO,
  OrdemProducaoCreateDTO,
  OrdemProducaoStatusUpdateDTO,
  FichaTecnica,
  MovimentacaoEstoque,
  OrdemProducao
} from '../types'

// Configuração base do axios
// Garante que a baseURL sempre inclua "/api" mesmo quando VITE_API_URL estiver setada como "http://localhost:8080"
const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const baseURL = rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/$/, '')}/api`

// Flag para controlar uso de mocks explicitamente via env
// Por padrão, NÃO usa mocks (apenas quando VITE_USE_MOCKS === 'true')
const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS).toLowerCase() === 'true'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || ''
    const isRelatorioEndpoint = url.includes('/relatorios/')
    const isNetworkError = !error.response
    const message = error?.message || 'Erro na API'

    // Em desenvolvimento, endpoints de relatórios podem não existir.
    // Evitar poluição com logs de erro quando for queda de rede e iremos usar mocks.
    if (isNetworkError) {
      if (USE_MOCKS) {
        console.info('API não disponível, usando mocks. Detalhes:', message)
      } else {
        console.error('Erro de rede na API:', message)
      }
    } else if (isRelatorioEndpoint) {
      console.info('Endpoint de relatórios indisponível, retornando vazio/mocks quando aplicável.')
    } else {
      // Para erros com resposta do backend, mostrar mensagem amigável quando possível
      console.error('Erro na API:', getApiErrorMessage(error))
    }
    return Promise.reject(error)
  }
)

// Helper para extrair mensagens amigáveis do backend em erros da API
function getApiErrorMessage(error: unknown): string {
  // Quando for um AxiosError, tentamos extrair a mensagem do corpo
  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError
    const data: unknown = axErr.response?.data
    // Backend atual retorna String no body para 400/404
    if (typeof data === 'string' && data.trim().length > 0) {
      return data
    }
    // Alguns backends retornam objeto com { message }
    if (data && typeof data === 'object' && 'message' in data) {
      const maybe = data as { message?: unknown }
      if (typeof maybe.message === 'string') {
        return maybe.message
      }
    }
    // Caso não haja body utilizável, usa status e mensagem padrão
    const status = axErr.response?.status
    if (status) {
      return `Erro na API (status ${status}): ${axErr.message}`
    }
    return axErr.message || 'Erro na API'
  }
  // Fallback para erros genéricos
  return error instanceof Error ? error.message : 'Erro na API'
}

// Helper para decidir se devemos usar mocks automaticamente em dev quando a API falhar
function shouldUseMocks(): boolean {
  // Apenas usa mocks quando explicitamente habilitado via VITE_USE_MOCKS=true
  return USE_MOCKS
}

// Dados mock para desenvolvimento (alinhados ao modelo atual do backend)
const mockProdutos: Produto[] = [
  {
    id: 'FARINHA_TRIGO',
    nome: 'Farinha de Trigo',
    desc: 'Ingrediente base para pães e massas',
    tipo: 'MATERIA_PRIMA',
    unidadeMedida: 'KG',
    quantidadeEmEstoque: 150
  },
  {
    id: 'ACUCAR_CRISTAL',
    nome: 'Açúcar Cristal',
    desc: 'Açúcar comum para confeitaria',
    tipo: 'MATERIA_PRIMA',
    unidadeMedida: 'KG',
    quantidadeEmEstoque: 25
  },
  {
    id: 'PAO_FRANCES',
    nome: 'Pão Francês',
    desc: 'Produto acabado pronto para venda',
    tipo: 'PRODUTO_ACABADO',
    unidadeMedida: 'UN',
    quantidadeEmEstoque: 200,
    estoqueMinimo: 150,
    estoqueRecomendado: 300
  }
]

// Mock de fichas técnicas (apenas quando USE_MOCKS === 'true')
const mockFichasTecnicas: FichaTecnica[] = []
// Mock para ordens de produção persistidas quando API não estiver disponível
const mockOrdensProducao: OrdemProducao[] = []
// Mock de preferências de usuário quando API não estiver disponível
const mockUserPreferences: Record<string, { voiceOnNewOrder: boolean }> = {}

// Serviços de Produtos
export const produtosService = {
  // Listar todos os produtos
  listar: async (): Promise<Produto[]> => {
    const attempt = async () => {
      const response = await api.get('/produtos')
      return response.data as Produto[]
    }

    try {
      return await attempt()
    } catch (error) {
      const isNetwork = axios.isAxiosError(error) && !error.response
      // Uma tentativa de retry rápida em caso de erro de rede/transiente
      if (isNetwork) {
        await new Promise(res => setTimeout(res, 500))
        try {
          return await attempt()
        } catch (err2) {
          if (shouldUseMocks()) {
            console.info('API não disponível, usando dados mock (após retry):', (axios.isAxiosError(err2) ? err2.message : String(err2)))
            return mockProdutos
          }
          throw err2
        }
      }
      if (shouldUseMocks()) {
        console.info('API não disponível, usando dados mock:', (axios.isAxiosError(error) ? error.message : String(error)))
        return mockProdutos
      }
      throw error
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id: string): Promise<Produto> => {
    try {
      const response = await api.get(`/produtos/${id}`)
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.info('API não disponível, buscando produto mock:', (axios.isAxiosError(error) ? error.message : String(error)))
        const produto = mockProdutos.find(p => p.id === id)
        if (!produto) {
          throw new Error('Produto não encontrado')
        }
        return produto
      }
      throw error
    }
  },

  // Criar novo produto (matéria-prima)
  criar: async (produto: ProdutoRequestDTO): Promise<Produto> => {
    try {
      const response = await api.post('/produtos', produto)
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.info('API não disponível, simulando criação:', (axios.isAxiosError(error) ? error.message : String(error)))
        const novoProduto: Produto = {
          id: produto.id || Date.now().toString(),
          nome: produto.nome,
          desc: produto.desc || '',
          tipo: produto.tipo,
          unidadeMedida: produto.unidadeMedida,
          quantidadeEmEstoque: 0
        }
        mockProdutos.push(novoProduto)
        return novoProduto
      }
      throw error
    }
  },

  // Dar entrada em produto
  darEntrada: async (entrada: ProdutoEntradaDTO): Promise<Produto> => {
    try {
      const response = await api.post(`/produtos/entrada`, entrada)
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.info('API não disponível, simulando entrada:', (axios.isAxiosError(error) ? error.message : String(error)))
        const produto = mockProdutos.find(p => p.id === entrada.produtoId)
        if (!produto) {
          throw new Error('Produto não encontrado')
        }
        produto.quantidadeEmEstoque = (produto.quantidadeEmEstoque ?? 0) + entrada.quantidade
        return produto
      }
      throw error
    }
  },

  // Dar baixa em produto
  darBaixa: async (produtoId: string, quantidade: number): Promise<Produto> => {
    try {
      const response = await api.post(`/produtos/baixa`, {
        produtoId,
        quantidade
      })
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.info('API não disponível, simulando baixa:', (axios.isAxiosError(error) ? error.message : String(error)))
        const produto = mockProdutos.find(p => p.id === produtoId)
        if (!produto) {
          throw new Error('Produto não encontrado')
        }
        produto.quantidadeEmEstoque = Math.max(0, (produto.quantidadeEmEstoque ?? 0) - quantidade)
        return produto
      }
      throw error
    }
  },

  // Deletar produto
  deletar: async (id: string): Promise<void> => {
    try {
      await api.delete(`/produtos/${id}`)
    } catch (error) {
      if (shouldUseMocks()) {
        console.info('API não disponível, simulando exclusão:', (axios.isAxiosError(error) ? error.message : String(error)))
        const index = mockProdutos.findIndex(p => p.id === id)
        if (index > -1) {
          mockProdutos.splice(index, 1)
        }
        return
      }
      // Propagar mensagem detalhada do backend
      throw new Error(getApiErrorMessage(error))
    }
  }
  ,
  // Atualizar produto
  atualizar: async (id: string, dto: ProdutoRequestDTO): Promise<Produto> => {
    try {
      const response = await api.put(`/produtos/${id}`, dto)
      return response.data as Produto
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, simulando atualização:', error)
        const produto = mockProdutos.find(p => p.id === id)
        if (!produto) {
          throw new Error('Produto não encontrado para atualização')
        }
        // Atualiza campos básicos
        produto.nome = dto.nome ?? produto.nome
        produto.desc = dto.desc ?? produto.desc
        produto.unidadeMedida = dto.unidadeMedida ?? produto.unidadeMedida
        if (dto.tipo) {
          produto.tipo = dto.tipo
        }
        return produto
      }
      throw new Error(getApiErrorMessage(error))
    }
  }
}

// Serviço de preferências de usuário (apenas configurações relacionadas ao frontend)
export const preferencesService = {
  // Buscar preferências de um usuário
  get: async (userId: string): Promise<{ voiceOnNewOrder: boolean }> => {
    try {
      const response = await api.get(`/user-preferences/${encodeURIComponent(userId)}`)
      // Espera forma { voiceOnNewOrder: boolean }
      return response.data as { voiceOnNewOrder: boolean }
    } catch (error) {
      if (shouldUseMocks()) {
        // fallback: usa mock em memória
        if (!(userId in mockUserPreferences)) {
          mockUserPreferences[userId] = { voiceOnNewOrder: true }
        }
        return mockUserPreferences[userId]
      }
      throw error
    }
  },

  // Atualizar preferências de um usuário
  update: async (userId: string, prefs: { voiceOnNewOrder: boolean }): Promise<void> => {
    try {
      await api.put(`/user-preferences/${encodeURIComponent(userId)}`, prefs)
    } catch (error) {
      if (shouldUseMocks()) {
        mockUserPreferences[userId] = { ...prefs }
        return
      }
      throw error
    }
  }
}

// Serviço de preferências globais do sistema
export const systemPreferencesService = {
  get: async (): Promise<{ voiceOnNewOrder: boolean }> => {
    try {
      const response = await api.get('/system-preferences')
      return response.data as { voiceOnNewOrder: boolean }
    } catch (error) {
      if (shouldUseMocks()) {
        // fallback: usa mock em memória, chave especial GLOBAL
        if (!('GLOBAL' in mockUserPreferences)) {
          mockUserPreferences['GLOBAL'] = { voiceOnNewOrder: true }
        }
        return mockUserPreferences['GLOBAL']
      }
      throw error
    }
  },
  update: async (prefs: { voiceOnNewOrder: boolean }): Promise<void> => {
    try {
      await api.put('/system-preferences', prefs)
    } catch (error) {
      if (shouldUseMocks()) {
        mockUserPreferences['GLOBAL'] = { ...prefs }
        return
      }
      throw error
    }
  }
}

// Serviços de Produção
export const producaoService = {
  // Criar produto acabado com ficha técnica
  criarProdutoAcabado: async (produto: ProdutoAcabadoRequestDTO): Promise<Produto> => {
    try {
      const response = await api.post('/producao/produto-acabado', produto)
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, simulando criação de produto acabado e ficha técnica:', error)

        // Garantir que o produto acabado exista/atualize no mockProdutos
        let produtoAcabado = mockProdutos.find(p => p.id === produto.id)
        if (!produtoAcabado) {
          produtoAcabado = {
            id: produto.id,
            nome: produto.nome,
            desc: produto.desc || '',
            tipo: 'PRODUTO_ACABADO',
            unidadeMedida: produto.unidadeMedida,
            quantidadeEmEstoque: 0,
            estoqueMinimo: produto.estoqueMinimo,
            estoqueRecomendado: produto.estoqueRecomendado
          }
          mockProdutos.push(produtoAcabado)
        } else {
          // Atualizar dados básicos
          produtoAcabado.nome = produto.nome
          produtoAcabado.desc = produto.desc || ''
          produtoAcabado.unidadeMedida = produto.unidadeMedida
          // Atualizar limites quando informados
          if (typeof produto.estoqueMinimo !== 'undefined') {
            produtoAcabado.estoqueMinimo = produto.estoqueMinimo
          }
          if (typeof produto.estoqueRecomendado !== 'undefined') {
            produtoAcabado.estoqueRecomendado = produto.estoqueRecomendado
          }
        }

        // Montar componentes da ficha técnica a partir dos IDs
        const componentes = produto.componentes.map((c, idx) => {
          const materia = mockProdutos.find(mp => mp.id === c.materiaPrimaId)
          if (!materia) {
            throw new Error(`Matéria-prima não encontrada: ${c.materiaPrimaId}`)
          }
          return {
            id: idx + 1,
            materiaPrima: materia,
            quantidade: c.quantidade
          }
        })

        // Atualizar ou criar a ficha técnica
        const existenteIndex = mockFichasTecnicas.findIndex(ft => ft.produtoAcabado.id === produto.id)
        const novaFicha: FichaTecnica = {
          id: `FT-${produto.id}`,
          produtoAcabado,
          componentes
        }

        if (existenteIndex >= 0) {
          mockFichasTecnicas[existenteIndex] = novaFicha
        } else {
          mockFichasTecnicas.push(novaFicha)
        }

        return produtoAcabado
      }
      // Propagar mensagem detalhada do backend
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Executar ordem de produção
  executarOrdem: async (ordem: OrdemProducaoRequestDTO): Promise<void> => {
    try {
      await api.post('/producao/executar', ordem)
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, simulando execução de ordem de produção:', error)
        // Simular consumo de matérias-primas e incremento do estoque do produto acabado
        const ficha = mockFichasTecnicas.find(ft => ft.produtoAcabado.id === ordem.produtoAcabadoId)
        const produtoAcabado = mockProdutos.find(p => p.id === ordem.produtoAcabadoId)
        if (!ficha || !produtoAcabado) return

        // Consome matérias-primas
        ficha.componentes.forEach(c => {
          const mp = mockProdutos.find(p => p.id === c.materiaPrima.id)
          if (mp) {
            mp.quantidadeEmEstoque = Math.max(0, (mp.quantidadeEmEstoque ?? 0) - c.quantidade * ordem.quantidadeAProduzir)
          }
        })
        // Incrementa produto acabado
        produtoAcabado.quantidadeEmEstoque = (produtoAcabado.quantidadeEmEstoque ?? 0) + ordem.quantidadeAProduzir
        return
      }
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Verificar viabilidade de produção
  verificarViabilidade: async (produtoId: string, quantidade: number): Promise<boolean> => {
    try {
      const response = await api.post('/producao/verificar-viabilidade', {
        produtoAcabadoId: produtoId,
        quantidadeAProduzir: quantidade
      })
      return response.data.viavel || false
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, simulando verificação de viabilidade:', error)
        const ficha = mockFichasTecnicas.find(ft => ft.produtoAcabado.id === produtoId)
        if (!ficha) return false
        // Nova regra: permitir criação mesmo se a matéria-prima NÃO existir.
        // Portanto, ao verificar viabilidade, IGNORAMOS componentes cuja matéria-prima não exista.
        // Só retorna inviável quando a matéria-prima EXISTE e o estoque é insuficiente.
        return ficha.componentes.every(c => {
          const mp = mockProdutos.find(p => p.id === c.materiaPrima.id)
          // Se a matéria-prima não existir, não bloqueia a criação (considera viável para este componente)
          if (!mp) return true
          const estoque = mp.quantidadeEmEstoque ?? 0
          const necessario = c.quantidade * quantidade
          return estoque >= necessario
        })
      }
      return false
    }
  },

  // Listar fichas técnicas
  listarFichasTecnicas: async (): Promise<FichaTecnica[]> => {
    try {
      const response = await api.get('/producao/fichas-tecnicas')
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, usando fichas técnicas mock:', error)
        return mockFichasTecnicas
      }
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Buscar ficha técnica por produto
  buscarFichaTecnica: async (produtoId: string): Promise<FichaTecnica> => {
    try {
      const response = await api.get(`/producao/fichas-tecnicas/${produtoId}`)
      return response.data
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, buscando ficha técnica mock:', error)
        const ficha = mockFichasTecnicas.find(ft => ft.produtoAcabado.id === produtoId)
        if (!ficha) {
          throw new Error('Ficha técnica não encontrada')
        }
        return ficha
      }
      throw new Error(getApiErrorMessage(error))
    }
  }
  ,

  // CRUD de Ordens de Produção (persistido no backend)
  // Listar ordens
  listarOrdensProducao: async (): Promise<OrdemProducao[]> => {
    try {
      const response = await api.get('/producao/ordens')
      // Converter datas para objeto Date e normalizar status
      const ordens: OrdemProducao[] = (response.data || []).map((o: any) => ({
        id: String(o.id),
        produtoAcabadoId: String(o.produtoAcabadoId ?? o.produtoId ?? o.produtoAcabado?.id ?? ''),
        produtoNome: String(o.produtoNome ?? o.produtoAcabadoNome ?? o.produtoAcabado?.nome ?? ''),
        quantidadeProduzida: Number(o.quantidadeProduzida ?? o.quantidadeAProduzir ?? 0),
        dataExecucao: o.dataExecucao ? new Date(o.dataExecucao) : new Date(),
        status: String(o.status ?? 'PENDENTE') as OrdemProducao['status']
      }))
      return ordens
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, usando ordens de produção mock:', error)
        return mockOrdensProducao
      }
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Criar nova ordem (PENDENTE por padrão)
  criarOrdemPersistida: async (dto: OrdemProducaoCreateDTO): Promise<OrdemProducao> => {
    try {
      const response = await api.post('/producao/ordens', dto)
      const o = response.data
      const ordem: OrdemProducao = {
        id: String(o.id),
        produtoAcabadoId: String(o.produtoAcabadoId ?? dto.produtoAcabadoId),
        produtoNome: String(o.produtoNome ?? ''),
        quantidadeProduzida: Number(o.quantidadeProduzida ?? dto.quantidadeAProduzir),
        dataExecucao: o.dataExecucao ? new Date(o.dataExecucao) : new Date(),
        status: String(o.status ?? 'PENDENTE') as OrdemProducao['status']
      }
      return ordem
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, criando ordem mock:', error)
        const ordem: OrdemProducao = {
          id: `OP-${Date.now()}`,
          produtoAcabadoId: dto.produtoAcabadoId,
          produtoNome: (mockProdutos.find(p => p.id === dto.produtoAcabadoId)?.nome) || '',
          quantidadeProduzida: dto.quantidadeAProduzir,
          dataExecucao: new Date(),
          status: 'PENDENTE'
        }
        mockOrdensProducao.unshift(ordem)
        return ordem
      }
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Atualizar status da ordem (EXECUTADA integrará consumo/produção no backend)
  atualizarStatusOrdem: async (id: string, status: OrdemProducaoStatusUpdateDTO['status']): Promise<OrdemProducao> => {
    try {
      const response = await api.patch(`/producao/ordens/${id}/status`, { status })
      const o = response.data
      const ordem: OrdemProducao = {
        id: String(o.id ?? id),
        produtoAcabadoId: String(o.produtoAcabadoId ?? o.produtoId ?? ''),
        produtoNome: String(o.produtoNome ?? ''),
        quantidadeProduzida: Number(o.quantidadeProduzida ?? 0),
        dataExecucao: o.dataExecucao ? new Date(o.dataExecucao) : new Date(),
        status: String(o.status ?? status) as OrdemProducao['status']
      }
      return ordem
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, atualizando status em ordens mock:', error)
        const idx = mockOrdensProducao.findIndex(o => o.id === id)
        if (idx >= 0) {
          mockOrdensProducao[idx] = { ...mockOrdensProducao[idx], status }
          return mockOrdensProducao[idx]
        }
        throw new Error('Ordem não encontrada (mock)')
      }
      throw new Error(getApiErrorMessage(error))
    }
  },

  // Deletar ordem
  deletarOrdem: async (id: string): Promise<void> => {
    try {
      await api.delete(`/producao/ordens/${id}`)
    } catch (error) {
      if (shouldUseMocks()) {
        console.warn('API não disponível, removendo ordem do mock:', error)
        const idx = mockOrdensProducao.findIndex(o => o.id === id)
        if (idx >= 0) mockOrdensProducao.splice(idx, 1)
        return
      }
      throw new Error(getApiErrorMessage(error))
    }
  }
}

// Serviços de Relatórios (simulados - implementar conforme API)
export const relatoriosService = {
  // Histórico de movimentações
  historicoMovimentacoes: async (
    dataInicio?: Date,
    dataFim?: Date,
    produtoId?: string
  ): Promise<MovimentacaoEstoque[]> => {
    // Implementar quando API estiver disponível
    const params = new URLSearchParams()
    if (dataInicio) params.append('dataInicio', dataInicio.toISOString())
    if (dataFim) params.append('dataFim', dataFim.toISOString())
    if (produtoId) params.append('produtoId', produtoId)

    try {
      const response = await api.get(`/relatorios/movimentacoes?${params}`)
      return response.data
    } catch {
      // Retornar dados mock se API não estiver implementada
      return []
    }
  },

  // Histórico de produção
  historicoProducao: async (
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<OrdemProducao[]> => {
    try {
      const params = new URLSearchParams()
      if (dataInicio) params.append('dataInicio', dataInicio.toISOString())
      if (dataFim) params.append('dataFim', dataFim.toISOString())

      const response = await api.get(`/relatorios/producao?${params}`)
      return response.data
    } catch {
      // Retornar dados mock se API não estiver implementada
      return []
    }
  },

  // Métricas do dashboard
  obterMetricas: async () => {
    try {
      const response = await api.get('/relatorios/metricas')
      return response.data
    } catch {
      // Retornar dados mock se API não estiver implementada
      return {
        totalProdutos: 0,
        produtosEstoqueBaixo: 0,
        producaoDiaria: 0,
        valorTotalEstoque: 0
      }
    }
  },

  // Função para Dashboard
  getDashboardMetrics: async () => {
    try {
      const response = await api.get('/relatorios/dashboard')
      return response.data
    } catch {
      // Retornar dados mock se API não estiver implementada
      return {
        crescimentoProdutos: 5.2,
        crescimentoEstoque: -2.1,
        crescimentoProducao: 8.7,
        crescimentoValor: 12.3
      }
    }
  },

  // Função para movimentações históricas
  getMovimentacoesHistoricas: async () => {
    try {
      const response = await api.get('/relatorios/movimentacoes-historicas')
      return response.data
    } catch {
      // Retornar dados mock se API não estiver implementada
      return []
    }
  }
}

export default api