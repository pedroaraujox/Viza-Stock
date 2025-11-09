import React, { useEffect, useState } from 'react'
import { 
  Search, 
  Filter, 
  AlertCircle,
  Download,
  Package
} from 'lucide-react'
import { useProdutoStore, useProdutosFiltrados } from '../../stores/produtoStore'
import { useNotifications } from '../../stores/uiStore'
// Página apenas de visualização: modais de criação/edição e estoque removidos
import type { Produto } from '../../types'
import { cn } from '../../lib/utils'

export const Produtos: React.FC = () => {
  const { 
    produtos, 
    loading, 
    error, 
    filtros,
    fetchProdutos, 
    setFiltros
  } = useProdutoStore()

  // Seleção computada dos produtos filtrados
  const produtosFiltrados = useProdutosFiltrados()
  
  const { showSuccess } = useNotifications()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProdutos()
  }, [fetchProdutos])

  // Na página de Produtos, sempre exibir apenas "Produto acabado"
  useEffect(() => {
    if (filtros.tipo !== 'PRODUTO_ACABADO') {
      setFiltros({ tipo: 'PRODUTO_ACABADO' })
    }
  }, [setFiltros])

  // Atualiza o filtro de busca apenas quando o termo muda.
  // Importante: não dependemos de `filtros` aqui para evitar loop infinito
  // (cada atualização de `filtros` causava nova execução deste effect).
  useEffect(() => {
    if (filtros.busca !== searchTerm) {
      setFiltros({ busca: searchTerm })
    }
  }, [searchTerm, filtros.busca, setFiltros])

  // Página de visualização: ações de criação/edição/exclusão removidas

  const handleExportarProdutos = () => {
    // Implementar exportação para CSV/Excel
    showSuccess('Exportação', 'Relatório de produtos exportado com sucesso')
  }

  const getStatusEstoque = (produto: Produto) => {
    const q = produto.quantidadeEmEstoque ?? 0
    if (q <= 0) {
      return { status: 'baixo', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' }
    }
    if (q <= 50) {
      return { status: 'medio', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' }
    }
    return { status: 'alto', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' }
  }

  const formatTipo = (tipo?: Produto['tipo']) => {
    switch (tipo) {
      case 'MATERIA_PRIMA':
        return 'Matéria-prima'
      case 'PRODUTO_ACABADO':
        return 'Produto acabado'
      default:
        return '—'
    }
  }

  const tiposDisponiveis = [...new Set(produtos?.map(p => p.tipo) || [])]

  // Garante que apenas produtos acabados sejam mostrados na página
  const produtosApenasAcabados = (produtosFiltrados || []).filter(p => p.tipo === 'PRODUTO_ACABADO')

  if (loading && (produtos?.length || 0) === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Produtos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {produtosApenasAcabados?.length || 0} produtos encontrados
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button 
            onClick={handleExportarProdutos}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Pesquisa */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botão de Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
              showFilters 
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo fixo: a página exibe apenas Produto acabado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={"PRODUTO_ACABADO"}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                >
                  <option value="PRODUTO_ACABADO">Produto acabado</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Esta página mostra apenas produtos acabados.</p>
              </div>

              {/* Botão Limpar Filtros */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    // Mantém o filtro de tipo como Produto acabado
                    setFiltros({ busca: undefined, tipo: 'PRODUTO_ACABADO' })
                    setSearchTerm('')
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Produtos */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {(produtosApenasAcabados?.length || 0) === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || Object.keys(filtros || {}).length > 0 
              ? 'Tente ajustar os filtros de pesquisa'
              : 'Comece adicionando seu primeiro produto'
            }
          </p>
          {/* Em modo visualização, não exibir botão de adicionar produto */}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosApenasAcabados.map((produto) => {
            const statusEstoque = getStatusEstoque(produto)
            
            return (
              <div
                key={produto.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Header do Card */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {produto.nome}
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTipo(produto.tipo)}
                        </p>
                        {/* ID do Produto exibido como badge monoespaçado */}
                        <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                          ID: {produto.id}
                        </span>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      statusEstoque.color,
                      statusEstoque.bg,
                      statusEstoque.border
                    )}>
                      {statusEstoque.status === 'baixo' && 'Baixo'}
                      {statusEstoque.status === 'medio' && 'Médio'}
                      {statusEstoque.status === 'alto' && 'Alto'}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Quantidade e Preço */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Estoque</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {produto.quantidadeEmEstoque} {produto.unidadeMedida}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Preço</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          —
                        </p>
                      </div>
                    </div>

                    {/* Estoque Mínimo: não disponível no backend atual */}
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Estoque mínimo:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {produto.estoqueMinimo} {produto.unidadeMedida}
                      </span>
                    </div> */}

                    {/* Descrição */}
                    {produto.desc && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {produto.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Página de visualização: seção de ações removida */}
              </div>
            )
          })}
        </div>
      )}

      {/* Página de visualização: modais removidos */}
    </div>
  )
}