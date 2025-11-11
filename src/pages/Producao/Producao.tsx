import React, { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Factory,
  Calendar,
  LayoutGrid,
  Table
} from 'lucide-react'
import { useProducaoStore } from '../../stores/producaoStore'
import { useProdutoStore } from '../../stores/produtoStore'
import type { OrdemProducao } from '../../types'
import { cn } from '../../lib/utils'
import { OrdemProducaoModal } from './OrdemProducaoModal'
import { ProdutoAcabadoModal } from './ProdutoAcabadoModal'
import { KanbanBoard } from '../../components/Kanban'
import { EditOrdemModal } from './EditOrdemModal'
import { speak } from '../../utils/voice'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'

export const Producao: React.FC = () => {
  const { 
    ordensProducao, 
    // loading global do store não deve bloquear a página inteira
    // loading,
    fetchFichasTecnicas,
    fetchOrdensProducao,
    alterarStatusOrdem,
    verificarViabilidade,
    // executarOrdem
  } = useProducaoStore()
  const { produtos, fetchProdutos } = useProdutoStore()
  const { user } = useAuthStore()
  const { getGlobal, loadGlobalFromBackend } = useSettingsStore()
  // Removido uso de notificações não utilizado para evitar avisos de lint
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTE' | 'EM_ANDAMENTO' | 'EXECUTADA' | 'CANCELADA'>('TODOS')
  const [ordemModalOpen, setOrdemModalOpen] = useState(false)
  const [produtoAcabadoModalOpen, setProdutoAcabadoModalOpen] = useState(false)
  const [, setSelectedOrdem] = useState<OrdemProducao | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [ordemEditando, setOrdemEditando] = useState<OrdemProducao | null>(null)
  // Novo estado local para controlar o carregamento inicial da página,
  // evitando que requisições feitas pelo modal ocultem toda a tela.
  const [loadingPagina, setLoadingPagina] = useState(true)
  // Estado para alternar entre visualização de tabela e kanban
  const [visualizacao, setVisualizacao] = useState<'tabela' | 'kanban'>('kanban')

  useEffect(() => {
    // Carregamento inicial: aguarda as duas chamadas e então libera a página
    Promise.all([
      fetchFichasTecnicas(),
      fetchProdutos(),
      fetchOrdensProducao()
    ]).finally(() => setLoadingPagina(false))
    // Dependemos apenas das funções (estáveis no zustand)
  }, [fetchFichasTecnicas, fetchProdutos, fetchOrdensProducao])

  // Carregar preferência GLOBAL ao montar a tela
  useEffect(() => {
    loadGlobalFromBackend()
  }, [loadGlobalFromBackend])

  // Filtrar ordens de produção
  const ordensFiltradas = ordensProducao.filter(ordem => {
    const matchSearch = ordem.produtoNome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === 'TODOS' || ordem.status === filtroStatus
    return matchSearch && matchStatus
  })

  // Estatísticas
  const totalOrdens = ordensProducao.length
  const ordensPendentes = ordensProducao.filter(o => o.status === 'PENDENTE').length
  const ordensExecutadas = ordensProducao.filter(o => o.status === 'EXECUTADA').length
  const ordensCanceladas = ordensProducao.filter(o => o.status === 'CANCELADA').length

  // Removido handler não utilizado para evitar avisos de lint

  const handleStatusChange = async (ordemId: string, novoStatus: 'PENDENTE' | 'EM_ANDAMENTO' | 'EXECUTADA' | 'CANCELADA') => {
    try {
      // Encontrar a ordem no estado atual
      const ordem = ordensProducao.find(o => o.id === ordemId)
      if (!ordem) return

      if (novoStatus === 'EXECUTADA') {
        const viavel = await verificarViabilidade(ordem.produtoAcabadoId, ordem.quantidadeProduzida)
        if (!viavel) {
          alert('Quantidade insuficiente em estoque para executar a ordem!')
          return
        }
        await alterarStatusOrdem(ordemId, 'EXECUTADA')
      } else {
        await alterarStatusOrdem(ordemId, novoStatus)
        // Aviso por voz quando uma ordem é movida para Pendentes
        if (novoStatus === 'PENDENTE') {
          const global = getGlobal()
          if (global.voiceOnNewOrder) {
            speak('Você tem novas ordens de produção')
          }
        }
      }
    
    } catch (error) {
      console.error('Erro ao mudar status:', error)
      alert('Erro ao mudar status da ordem')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
      case 'EXECUTADA':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
      case 'CANCELADA':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="w-4 h-4" />
      case 'EM_ANDAMENTO':
        return <Factory className="w-4 h-4" />
      case 'EXECUTADA':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELADA':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  // Editar ordem (MVP): permite alterar quantidade produzida via prompt
  const { editarOrdem, deletarOrdem } = useProducaoStore()

  const handleEditOrdem = (ordem: OrdemProducao) => {
    setOrdemEditando(ordem)
    setEditModalOpen(true)
  }

  const handleDeleteOrdem = async (ordem: OrdemProducao) => {
    const confirmar = window.confirm(`Tem certeza que deseja excluir a ordem #${ordem.id} de "${ordem.produtoNome}"?`)
    if (!confirmar) return
    try {
      await deletarOrdem(ordem.id)
    } catch (error) {
      console.error('Erro ao deletar ordem:', error)
      alert('Erro ao deletar ordem de produção')
    }
  }

  // Mostra esqueleto apenas durante o carregamento inicial da página.
  if (loadingPagina) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
            Ordens de Produção
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerenciamento e controle da produção
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setProdutoAcabadoModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Produto Acabado</span>
          </button>
          <button
            onClick={() => setOrdemModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Ordens</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOrdens}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ordensPendentes}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Executadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ordensExecutadas}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Canceladas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ordensCanceladas}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar ordens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Status */}
          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(
                e.target.value as 'TODOS' | 'PENDENTE' | 'EM_ANDAMENTO' | 'EXECUTADA' | 'CANCELADA'
              )
            }
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="EXECUTADA">Executadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>

          {/* Botões de Visualização */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVisualizacao('tabela')}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors",
                visualizacao === 'tabela'
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
            >
              <Table className="w-4 h-4" />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setVisualizacao('kanban')}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors",
                visualizacao === 'kanban'
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Botão Limpar */}
          <button
            onClick={() => {
              setSearchTerm('')
              setFiltroStatus('TODOS')
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Mensagem de lista vazia (apenas na visualização em tabela) */}
      {ordensFiltradas.length === 0 && visualizacao === 'tabela' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
          <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filtroStatus !== 'TODOS' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de produção'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filtroStatus !== 'TODOS'
              ? 'Tente ajustar os filtros de pesquisa'
              : 'Comece criando sua primeira ordem de produção'
            }
          </p>
          {!searchTerm && filtroStatus === 'TODOS' && (
            <button
              onClick={() => setOrdemModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira Ordem</span>
            </button>
          )}
        </div>
      )}

      {/* Visualização de Ordens - Tabela ou Kanban */}
      {visualizacao === 'kanban' && (
        <KanbanBoard 
          ordens={ordensFiltradas} 
          onStatusChange={handleStatusChange}
          onEdit={handleEditOrdem}
          onDelete={handleDeleteOrdem}
        />
      )}

      {ordensFiltradas.length > 0 && visualizacao === 'tabela' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {ordensFiltradas.map((ordem) => (
                  <tr key={ordem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{ordem.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ordem.produtoNome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {ordem.quantidadeProduzida} {(() => {
                        const produto = produtos.find(p => p.id === ordem.produtoAcabadoId)
                        return produto?.unidadeMedida || ''
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(ordem.status)
                      )}>
                        {getStatusIcon(ordem.status)}
                        <span className="ml-1">{ordem.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(ordem.dataExecucao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrdem(ordem)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais */}
      {ordemModalOpen && (
        <OrdemProducaoModal
          onClose={() => setOrdemModalOpen(false)}
          onSuccess={() => {
            setOrdemModalOpen(false)
          }}
        />
      )}

      {produtoAcabadoModalOpen && (
        <ProdutoAcabadoModal
          onClose={() => setProdutoAcabadoModalOpen(false)}
          onSuccess={() => {
            setProdutoAcabadoModalOpen(false)
          }}
        />
      )}

      {editModalOpen && ordemEditando && (
        <EditOrdemModal
          ordem={ordemEditando}
          onClose={() => {
            setEditModalOpen(false)
            setOrdemEditando(null)
          }}
          onSuccess={() => {
            setEditModalOpen(false)
            setOrdemEditando(null)
          }}
        />
      )}
    </div>
  )
}