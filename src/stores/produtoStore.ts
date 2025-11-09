import { create } from 'zustand'
import type { Produto, ProdutoRequestDTO, ProdutoEntradaDTO, FiltrosProdutos } from '../types'
import { produtosService } from '../services/api'

interface ProdutoStore {
  // Estado
  produtos: Produto[]
  loading: boolean
  error: string | null
  filtros: FiltrosProdutos

  // Ações
  fetchProdutos: () => Promise<void>
  criarProduto: (produto: ProdutoRequestDTO) => Promise<void>
  atualizarProduto: (id: string, produto: ProdutoRequestDTO) => Promise<void>
  darEntrada: (entrada: ProdutoEntradaDTO) => Promise<void>
  darBaixa: (produtoId: string, quantidade: number) => Promise<void>
  deletarProduto: (id: string) => Promise<void>
  buscarPorId: (id: string) => Promise<Produto | null>
  setFiltros: (filtros: Partial<FiltrosProdutos>) => void
  clearError: () => void
}

export const useProdutoStore = create<ProdutoStore>((set, get) => ({
  // Estado inicial
  produtos: [],
  loading: false,
  error: null,
  filtros: {
    ordenacao: 'nome',
    direcao: 'asc'
  },

  // Buscar todos os produtos
  fetchProdutos: async () => {
    set({ loading: true, error: null })
    try {
      const produtos = await produtosService.listar()
      set({ produtos: produtos || [], loading: false })
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      set({ 
        produtos: [],
        error: error instanceof Error ? error.message : 'Erro ao carregar produtos',
        loading: false 
      })
    }
  },

  // Criar novo produto
  criarProduto: async (produto: ProdutoRequestDTO) => {
    set({ loading: true, error: null })
    try {
      const novoProduto = await produtosService.criar(produto)
      set(state => ({
        produtos: [...state.produtos, novoProduto],
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao criar produto',
        loading: false 
      })
      throw error
    }
  },

  // Atualizar produto
  atualizarProduto: async (id: string, produto: ProdutoRequestDTO) => {
    set({ loading: true, error: null })
    try {
      const produtoAtualizado = await produtosService.atualizar(id, produto)
      set(state => ({
        produtos: state.produtos.map(p => p.id === produtoAtualizado.id ? produtoAtualizado : p),
        loading: false
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao atualizar produto',
        loading: false
      })
      throw error
    }
  },

  // Dar entrada no estoque
  darEntrada: async (entrada: ProdutoEntradaDTO) => {
    set({ loading: true, error: null })
    try {
      const produtoAtualizado = await produtosService.darEntrada(entrada)
      set(state => ({
        produtos: state.produtos.map(p => 
          p.id === produtoAtualizado.id ? produtoAtualizado : p
        ),
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao dar entrada no estoque',
        loading: false 
      })
      throw error
    }
  },

  // Dar baixa no estoque
  darBaixa: async (produtoId: string, quantidade: number) => {
    set({ loading: true, error: null })
    try {
      const produtoAtualizado = await produtosService.darBaixa(produtoId, quantidade)
      set(state => ({
        produtos: state.produtos.map(p => 
          p.id === produtoAtualizado.id ? produtoAtualizado : p
        ),
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao dar baixa no estoque',
        loading: false 
      })
      throw error
    }
  },

  // Deletar produto
  deletarProduto: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await produtosService.deletar(id)
      set(state => ({
        produtos: state.produtos.filter(p => p.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao deletar produto',
        loading: false 
      })
      throw error
    }
  },

  // Buscar produto por ID
  buscarPorId: async (id: string) => {
    const { produtos } = get()
    
    // Primeiro verifica se já está no estado
    const produtoExistente = produtos.find(p => p.id === id)
    if (produtoExistente) {
      return produtoExistente
    }

    // Se não estiver, busca na API
    try {
      const produto = await produtosService.buscarPorId(id)
      return produto
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar produto'
      })
      return null
    }
  },

  // Definir filtros
  setFiltros: (novosFiltros: Partial<FiltrosProdutos>) => {
    set(state => ({
      filtros: { ...state.filtros, ...novosFiltros }
    }))
  },

  // Limpar erro
  clearError: () => {
    set({ error: null })
  }
}))

// Seletores computados
export const useProdutosFiltrados = () => {
  const { produtos, filtros } = useProdutoStore()

  return produtos
    .filter(produto => {
      // Filtro por tipo
      if (filtros.tipo && produto.tipo !== filtros.tipo) {
        return false
      }

      // Filtro por busca (nome ou ID)
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase()
        return (
          produto.nome.toLowerCase().includes(busca) ||
          produto.id.toLowerCase().includes(busca)
        )
      }

      return true
    })
    .sort((a, b) => {
      const { ordenacao, direcao } = filtros
      let comparacao = 0

      switch (ordenacao) {
        case 'nome':
          comparacao = a.nome.localeCompare(b.nome)
          break
        case 'estoque':
          comparacao = a.quantidadeEmEstoque - b.quantidadeEmEstoque
          break
        case 'tipo':
          comparacao = a.tipo.localeCompare(b.tipo)
          break
        default:
          comparacao = 0
      }

      return direcao === 'desc' ? -comparacao : comparacao
    })
}

// Seletores específicos
export const useMateriasPrivas = () => {
  const produtos = useProdutoStore(state => state.produtos)
  return produtos.filter(p => p.tipo === 'MATERIA_PRIMA')
}

export const useProdutosAcabados = () => {
  const produtos = useProdutoStore(state => state.produtos)
  return produtos.filter(p => p.tipo === 'PRODUTO_ACABADO')
}

export const useProdutosEstoqueBaixo = (limite = 10) => {
  const produtos = useProdutoStore(state => state.produtos)
  if (!Array.isArray(produtos)) return []
  // Backend atual não possui "estoqueMinimo"; usamos um limite fornecido
  return produtos.filter(p => (p.quantidadeEmEstoque ?? 0) <= limite)
}