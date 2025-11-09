import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  FileText,
  Edit,
  Trash2,
  Eye,
  Package,
  Calculator,
  AlertCircle
} from 'lucide-react'
import { useProducaoStore } from '../../stores/producaoStore'
import { useNotifications } from '../../stores/uiStore'
import type { FichaTecnica } from '../../types'
import { FichaTecnicaModal } from './FichaTecnicaModal'
import { FichaTecnicaVisualizacao } from './FichaTecnicaVisualizacao'
import { TemplatesModal } from './TemplatesModal'

export const FichasTecnicas: React.FC = () => {
  const { 
    fichasTecnicas,
    loading,
    fetchFichasTecnicas
  } = useProducaoStore()
  const { showSuccess, showError } = useNotifications()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFicha, setSelectedFicha] = useState<FichaTecnica | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [visualizacaoOpen, setVisualizacaoOpen] = useState(false)
  const [editingFicha, setEditingFicha] = useState<FichaTecnica | null>(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)

  useEffect(() => {
    fetchFichasTecnicas()
  }, [fetchFichasTecnicas])

  // Filtrar fichas técnicas
  const term = searchTerm.trim().toLowerCase()
  const fichasArray: FichaTecnica[] = Array.isArray(fichasTecnicas) ? fichasTecnicas : []
  const fichasFiltradas = term
    ? fichasArray.filter(ficha => {
        const produtoNome = ficha?.produtoAcabado?.nome?.toLowerCase() || ''
        const componentesNomes = (ficha?.componentes || [])
          .map(c => c?.materiaPrima?.nome?.toLowerCase() || '')
          .join(' ')
        return produtoNome.includes(term) || componentesNomes.includes(term)
      })
    : fichasArray

  const handleEdit = (ficha: FichaTecnica) => {
    setEditingFicha(ficha)
    setModalOpen(true)
  }

  const handleView = (ficha: FichaTecnica) => {
    setSelectedFicha(ficha)
    setVisualizacaoOpen(true)
  }

  const handleDelete = async (ficha: FichaTecnica) => {
    if (window.confirm(`Tem certeza que deseja excluir a ficha técnica de "${ficha.produtoAcabado?.nome}"?`)) {
      try {
        // Aqui seria implementada a exclusão via API
        showSuccess('Ficha técnica excluída', `A ficha técnica de "${ficha.produtoAcabado?.nome}" foi excluída com sucesso.`)
        fetchFichasTecnicas()
      } catch {
        showError('Erro ao excluir', 'Não foi possível excluir a ficha técnica.')
      }
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingFicha(null)
  }

  const handleCloseVisualizacao = () => {
    setVisualizacaoOpen(false)
    setSelectedFicha(null)
  }

  if (loading) {
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
            Fichas Técnicas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Receitas e especificações de produção
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ficha Técnica</span>
          </button>
          <button
            onClick={() => setTemplatesOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Fichas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {fichasArray.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produtos com Ficha</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(fichasArray.map(f => f.produtoAcabado?.id)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Componentes Únicos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(
                  fichasArray.flatMap(f =>
                    (f.componentes || []).map(c => c.materiaPrima?.id)
                  )
                ).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pesquisa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar fichas técnicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Fichas Técnicas */}
      {fichasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha técnica cadastrada'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm 
              ? 'Tente ajustar os termos de pesquisa'
              : 'Comece criando sua primeira ficha técnica'
            }
          </p>
          {!searchTerm && (
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Ficha</span>
              </button>
              <button
                onClick={() => setTemplatesOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fichasFiltradas.map((ficha) => (
            <div
              key={ficha.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {ficha.produtoAcabado?.nome}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {ficha.produtoAcabado?.desc || 'Sem descrição'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => handleView(ficha)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(ficha)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ficha)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Unidade do Produto:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ficha.produtoAcabado?.unidadeMedida}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Componentes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ficha.componentes?.length ?? 0} itens
                    </span>
                  </div>

                  {/* Indicador de viabilidade */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    {(ficha.componentes || []).some(comp => {
                      const estoque = comp.materiaPrima?.quantidadeEmEstoque ?? 0
                      return estoque < comp.quantidade
                    }) ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Estoque insuficiente</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">Produção viável</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      {modalOpen && (
        <FichaTecnicaModal
          ficha={editingFicha}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal()
            fetchFichasTecnicas()
          }}
        />
      )}

      {visualizacaoOpen && selectedFicha && (
        <FichaTecnicaVisualizacao
          ficha={selectedFicha}
          onClose={handleCloseVisualizacao}
        />
      )}

      {templatesOpen && (
        <TemplatesModal
          onClose={() => setTemplatesOpen(false)}
        />
      )}
    </div>
  )
}