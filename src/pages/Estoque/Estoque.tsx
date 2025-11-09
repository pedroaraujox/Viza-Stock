import React, { useEffect, useState } from 'react'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Package,
  AlertTriangle,
  Calendar,
  Download,
  PlusCircle,
  Pencil,
  Trash2
} from 'lucide-react'
import { useProdutoStore, useProdutosEstoqueBaixo } from '../../stores/produtoStore'
import { relatoriosService, producaoService } from '../../services/api'
import type { MovimentacaoEstoque, Produto } from '../../types'
import { cn } from '../../lib/utils'
import { useNotifications } from '../../stores/uiStore'
import { EstoqueModal } from '../Produtos'
import { usePermissions } from '../../stores/authStore'

export const Estoque: React.FC = () => {
  const { produtos, fetchProdutos, deletarProduto } = useProdutoStore()
  const limiteEstoqueBaixo = 10
  const produtosEstoqueBaixo = useProdutosEstoqueBaixo(limiteEstoqueBaixo)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS')
  const [filtroData, setFiltroData] = useState('')
  const [tipoEstoque, setTipoEstoque] = useState<'PRODUTO' | 'MATERIA_PRIMA'>('PRODUTO')
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [cadastroId, setCadastroId] = useState('')
  const [cadastroNome, setCadastroNome] = useState('')
  const [cadastroUnidade, setCadastroUnidade] = useState('UN')
  const [cadastroDesc, setCadastroDesc] = useState('')
  const [cadastroLoading, setCadastroLoading] = useState(false)
  const [cadastroErro, setCadastroErro] = useState<string | null>(null)
  // Estado para modal de movimentação de estoque (Entrada/Saída)
  const [estoqueModalAberto, setEstoqueModalAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const { showSuccess, showError } = useNotifications()
  const { canAccessSystem } = usePermissions()
  const podeEditarExcluir = canAccessSystem(['ROOT', 'ADMINISTRADOR'])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchProdutos()
        const movimentacoesData = await relatoriosService.getMovimentacoesHistoricas()
        setMovimentacoes(movimentacoesData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchProdutos])

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchSearch = mov.produtoNome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'TODOS' || mov.tipo === filtroTipo
    const matchData = !filtroData || new Date(mov.data).toISOString().split('T')[0] === filtroData
    
  return matchSearch && matchTipo && matchData
  })

  // Ações de edição/exclusão
  const abrirModalEstoque = (produto: Produto) => {
    if (!podeEditarExcluir) {
      showError('Permissão negada', 'Somente usuários ROOT ou ADMINISTRADOR podem editar o estoque.')
      return
    }
    setProdutoSelecionado(produto)
    setEstoqueModalAberto(true)
  }

  const fecharModalEstoque = () => {
    setEstoqueModalAberto(false)
    setProdutoSelecionado(null)
  }

  const handleExcluirProduto = async (produto: Produto) => {
    if (!podeEditarExcluir) {
      showError('Permissão negada', 'Somente usuários ROOT ou ADMINISTRADOR podem excluir itens do estoque.')
      return
    }
    const confirmar = window.confirm(`Tem certeza que deseja excluir "${produto.nome}"? Esta ação não pode ser desfeita.`)
    if (!confirmar) return
    try {
      await deletarProduto(produto.id)
      showSuccess('Produto excluído', `"${produto.nome}" foi excluído com sucesso.`)
    } catch (err) {
      showError('Erro ao excluir', err instanceof Error ? err.message : 'Não foi possível excluir o produto.')
    }
  }

  // Calcular estatísticas
  const totalProdutos = produtos.length
  const quantidadeTotalEmEstoque = produtos.reduce((total, produto) => 
    total + (produto.quantidadeEmEstoque || 0), 0
  )
  const entradasHoje = movimentacoesFiltradas.filter(m => 
    m.tipo === 'ENTRADA' && 
    new Date(m.data).toDateString() === new Date().toDateString()
  ).length
  const saidasHoje = movimentacoesFiltradas.filter(m => 
    m.tipo === 'SAIDA' && 
    new Date(m.data).toDateString() === new Date().toDateString()
  ).length

  // Lista de produtos filtrados para exibição no estoque
  const produtosFiltrados = produtos
    .filter(p => tipoEstoque === 'PRODUTO' ? p.tipo === 'PRODUTO_ACABADO' : p.tipo === 'MATERIA_PRIMA')
    .filter(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
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
      {/* Modal de Cadastro */}
      {cadastroAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !cadastroLoading && setCadastroAberto(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4 border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cadastrar {tipoEstoque === 'PRODUTO' ? 'Produto' : 'Matéria prima'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {tipoEstoque === 'PRODUTO'
                  ? 'Crie um novo produto acabado. A ficha técnica pode ser adicionada posteriormente.'
                  : 'Crie uma nova matéria prima para uso na produção.'}
              </p>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                setCadastroErro(null)
                setCadastroLoading(true)
                try {
                  if (tipoEstoque === 'MATERIA_PRIMA') {
                    await useProdutoStore.getState().criarProduto({
                      id: cadastroId || undefined,
                      nome: cadastroNome,
                      desc: cadastroDesc || undefined,
                      tipo: 'MATERIA_PRIMA',
                      unidadeMedida: cadastroUnidade
                    })
                  } else {
                    await producaoService.criarProdutoAcabado({
                      id: undefined,
                      nome: cadastroNome,
                      desc: cadastroDesc || undefined,
                      unidadeMedida: 'UN',
                      componentes: []
                    })
                    // Recarregar lista de produtos
                    await fetchProdutos()
                  }
                  setCadastroAberto(false)
                  setCadastroId('')
                  setCadastroNome('')
                  setCadastroUnidade('UN')
                  setCadastroDesc('')
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Erro ao salvar'
                  setCadastroErro(message)
                } finally {
                  setCadastroLoading(false)
                }
              }}
            >
              {/* Campos específicos por tipo de estoque */}
              {tipoEstoque === 'PRODUTO' ? (
                // Formulário para Estoque de Produtos (apenas Nome, Tipo e Descrição)
                <div className="space-y-4">
                  {/* Tipo - fixo como Produto acabado para cumprir requisito visual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select
                      value="PRODUTO_ACABADO"
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PRODUTO_ACABADO">Produto acabado</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Formulário para Estoque de Matéria-prima (mantém como antes)
                <>
                  {/* ID (opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID (opcional)</label>
                  <input
                      type="text"
                      value={cadastroId}
                      onChange={(e) => setCadastroId(e.target.value)}
                      placeholder={'Ex: 01, 02, 10'}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se não informado, o sistema gera automaticamente. IDs numéricos (apenas dígitos).</p>
                  </div>

                  {/* Unidade de Medida */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade de Medida</label>
                    <select
                      value={cadastroUnidade}
                      onChange={(e) => setCadastroUnidade(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UN">UN - Unidade</option>
                      <option value="KG">KG - Quilograma</option>
                      <option value="G">G - Grama</option>
                      <option value="L">L - Litro</option>
                      <option value="ML">ML - Mililitro</option>
                    </select>
                  </div>
                </>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={cadastroNome}
                  onChange={(e) => setCadastroNome(e.target.value)}
                  placeholder={tipoEstoque === 'PRODUTO' ? 'Nome do produto acabado' : 'Nome da matéria prima'}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Para produtos: unidade padrão 'UN' (não exibida). Para matéria-prima: unidade configurável acima. */}

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (opcional)</label>
                <textarea
                  value={cadastroDesc}
                  onChange={(e) => setCadastroDesc(e.target.value)}
                  rows={3}
                  placeholder="Descrição breve"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {cadastroErro && (
                <div className="text-sm text-red-600 dark:text-red-400">{cadastroErro}</div>
              )}

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={cadastroLoading}
                  onClick={() => setCadastroAberto(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cadastroLoading || !cadastroNome}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors',
                    cadastroLoading ? 'bg-green-300 text-white' : 'bg-green-600 text-white hover:bg-green-700'
                  )}
                >
                  {cadastroLoading ? 'Salvando...' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Controle de Estoque
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Movimentações e status do estoque
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setCadastroAberto(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              Cadastrar {tipoEstoque === 'PRODUTO' ? 'Produto' : 'Matéria prima'}
            </span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* Seletor de Tipo de Estoque */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tipo de Estoque</p>
            <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setTipoEstoque('PRODUTO')}
                className={cn(
                  'px-4 py-2 text-sm focus:outline-none transition-colors',
                  tipoEstoque === 'PRODUTO'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
              >
                Produto
              </button>
              <button
                type="button"
                onClick={() => setTipoEstoque('MATERIA_PRIMA')}
                className={cn(
                  'px-4 py-2 text-sm border-l border-gray-200 dark:border-gray-700 focus:outline-none transition-colors',
                  tipoEstoque === 'MATERIA_PRIMA'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
              >
                Matéria prima
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {tipoEstoque === 'PRODUTO' ? (
              <span>
                Visualizando estoque de produtos acabados (itens vendidos aos clientes).
              </span>
            ) : (
              <span>
                Visualizando estoque de matéria prima (insumos utilizados na produção).
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalProdutos}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Itens em Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quantidadeTotalEmEstoque.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Entradas Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {entradasHoje}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saídas Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {saidasHoje}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos em Estoque */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {tipoEstoque === 'PRODUTO' ? 'Produtos em Estoque' : 'Matérias-primas em Estoque'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {produtosFiltrados.length} itens encontrados
            </p>
          </div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar o tipo de estoque ou a pesquisa acima
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {produtosFiltrados.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.nome}</p>
                    {p.desc && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{p.desc}</p>
                    )}
                  </div>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    p.tipo === 'PRODUTO_ACABADO'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                  )}>
                    {p.tipo === 'PRODUTO_ACABADO' ? 'Produto' : 'Matéria-prima'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estoque</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {p.quantidadeEmEstoque} {p.unidadeMedida}
                    </p>
                  </div>
                  {/* Ações: Editar (Entrada/Saída) e Excluir */}
                  {podeEditarExcluir ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => abrirModalEstoque(p)}
                        title="Editar estoque (adicionar/retirar)"
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Pencil className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => handleExcluirProduto(p)}
                        title="Excluir produto"
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Sem permissão para editar/excluir</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Movimentação de Estoque (Entrada/Saída) */}
      {produtoSelecionado && (
        <EstoqueModal
          produto={produtoSelecionado}
          isOpen={estoqueModalAberto}
          onClose={fecharModalEstoque}
        />
      )}

      {/* Alertas de Estoque Baixo */}
      {produtosEstoqueBaixo.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Alertas de Estoque Baixo
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {produtosEstoqueBaixo.slice(0, 6).map((produto) => (
              <div
                key={produto.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {produto.nome}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Atual: {produto.quantidadeEmEstoque} {produto.unidadeMedida} | 
                  Limite: {limiteEstoqueBaixo} {produto.unidadeMedida}
                </p>
              </div>
            ))}
          </div>
          
          {produtosEstoqueBaixo.length > 6 && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3">
              E mais {produtosEstoqueBaixo.length - 6} produtos com estoque baixo...
            </p>
          )}
        </div>
      )}

      {/* Filtros e Pesquisa */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as 'TODOS' | 'ENTRADA' | 'SAIDA')}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">Todos os tipos</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas</option>
          </select>

          {/* Filtro por Data */}
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Botão Limpar */}
          <button
            onClick={() => {
              setSearchTerm('')
              setFiltroTipo('TODOS')
              setFiltroData('')
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Histórico de Movimentações */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Movimentações
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {movimentacoesFiltradas.length} movimentações encontradas
          </p>
        </div>

        {movimentacoesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma movimentação encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar os filtros de pesquisa
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {movimentacoesFiltradas.map((movimentacao, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {movimentacao.produtoNome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        movimentacao.tipo === 'ENTRADA'
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                      )}>
                        {movimentacao.tipo === 'ENTRADA' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {movimentacao.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {movimentacao.quantidade} {(() => {
                        const produto = produtos.find(p => p.id === movimentacao.produtoId)
                        return produto?.unidadeMedida || ''
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(movimentacao.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {movimentacao.observacao || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}