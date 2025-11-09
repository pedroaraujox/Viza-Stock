import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Package } from 'lucide-react'
import { useProdutoStore } from '../../stores/produtoStore'
import { useNotifications } from '../../stores/uiStore'
import type { Produto, ProdutoRequestDTO } from '../../types'
import { cn } from '../../lib/utils'

const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória')
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface ProdutoModalProps {
  produto?: Produto | null
  isOpen: boolean
  onClose: () => void
  isEditing: boolean
}

// Apenas "Produto acabado" deve aparecer como opção de categoria
const categorias = [
  'Produto acabado'
]

export const ProdutoModal: React.FC<ProdutoModalProps> = ({
  produto,
  isOpen,
  onClose,
  isEditing
}) => {
  const { criarProduto, atualizarProduto, loading } = useProdutoStore()
  const { showSuccess, showError } = useNotifications()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: (() => {
      // Independente do tipo do backend, sempre exibir/preselecionar "Produto acabado"
      return produto ? {
        nome: produto.nome,
        descricao: produto.desc || '',
        categoria: 'Produto acabado',
        unidadeMedida: produto.unidadeMedida
      } : {
        nome: '',
        descricao: '',
        categoria: 'Produto acabado',
        unidadeMedida: 'UN'
      }
    })()
  })

  const onSubmit = async (data: ProdutoFormData) => {
    try {
      // Mapeia categoria do formulário para o tipo esperado pelo backend
      const mapCategoriaParaTipo = (categoria: string): ProdutoRequestDTO['tipo'] => {
        const c = (categoria || '').toLowerCase()
        if (c.includes('acabado')) {
          return 'PRODUTO_ACABADO'
        }
        // Padrão: matéria-prima
        return 'MATERIA_PRIMA'
      }

      const produtoData: ProdutoRequestDTO = {
        nome: data.nome,
        desc: data.descricao || undefined,
        tipo: mapCategoriaParaTipo(data.categoria),
        unidadeMedida: data.unidadeMedida
      }

      if (isEditing && produto) {
        await atualizarProduto(produto.id, produtoData)
        showSuccess('Produto atualizado', 'As informações do produto foram atualizadas com sucesso')
      } else {
        await criarProduto(produtoData)
        showSuccess('Produto criado', 'Novo produto foi adicionado com sucesso')
      }

      reset()
      onClose()
    } catch (error) {
      showError(
        'Erro ao salvar produto',
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      )
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditing ? 'Atualize as informações do produto' : 'Adicione um novo produto ao estoque'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Em modo edição, nenhuma advertência é necessária agora que o backend suporta atualização */}
          {/* Nome e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                {...register('nome')}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.nome
                    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                )}
                placeholder="Digite o nome do produto"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                {...register('categoria')}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.categoria
                    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                )}
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.categoria.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
              placeholder="Descrição detalhada do produto (opcional)"
            />
          </div>

        {/* Unidade de Medida e Preço */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidades
            </label>
            <select
                {...register('unidadeMedida')}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors.unidadeMedida
                    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                )}
              >
                {/* Exibir apenas a opção única "UNIDADE" com valor "UN" para compatibilidade */}
                <option value="UN">UNIDADE</option>
              </select>
              {errors.unidadeMedida && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.unidadeMedida.message}
                </p>
              )}
            </div>
          </div>

          {/* Removido: campos de preço, estoque mínimo e quantidade inicial (não suportados pelo backend atual) */}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting || loading 
                ? 'Salvando...' 
                : isEditing 
                  ? 'Atualizar Produto' 
                  : 'Criar Produto'
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}