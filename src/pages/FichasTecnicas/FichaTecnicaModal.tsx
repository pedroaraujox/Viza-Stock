import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2 } from 'lucide-react'
import { useProdutoStore } from '../../stores/produtoStore'
import { useProducaoStore } from '../../stores/producaoStore'
import { useNotifications } from '../../stores/uiStore'
import type { FichaTecnica } from '../../types'
import { cn } from '../../lib/utils'

const fichaTecnicaSchema = z.object({
  produtoId: z.string().min(1, 'Selecione um produto'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidadeFinal: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória'),
  componentes: z.array(z.object({
    produtoId: z.string().min(1, 'Selecione um produto'),
    quantidade: z.number().min(0.01, 'Quantidade deve ser maior que zero')
  })).min(1, 'Adicione pelo menos um componente')
})

type FichaTecnicaFormData = z.infer<typeof fichaTecnicaSchema>

interface FichaTecnicaModalProps {
  ficha?: FichaTecnica | null
  onClose: () => void
  onSuccess: () => void
}

export const FichaTecnicaModal: React.FC<FichaTecnicaModalProps> = ({
  ficha,
  onClose,
  onSuccess
}) => {
  const { produtos, fetchProdutos } = useProdutoStore()
  const { criarProdutoAcabado } = useProducaoStore()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FichaTecnicaFormData>({
    resolver: zodResolver(fichaTecnicaSchema),
    defaultValues: {
      produtoId: ficha?.produtoAcabado?.id || '',
      descricao: ficha?.produtoAcabado?.desc || '',
      quantidadeFinal: 1,
      unidadeMedida: ficha?.produtoAcabado?.unidadeMedida || '',
      componentes: ficha?.componentes
        ? ficha.componentes.map(c => ({ produtoId: c.materiaPrima.id, quantidade: c.quantidade }))
        : [{ produtoId: '', quantidade: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'componentes'
  })

  const watchedProdutoId = watch('produtoId')

  useEffect(() => {
    fetchProdutos()
  }, [fetchProdutos])

  // Atualizar unidade de medida quando produto é selecionado
  useEffect(() => {
    if (watchedProdutoId) {
      const produto = produtos.find(p => p.id === watchedProdutoId)
      if (produto) {
        setValue('unidadeMedida', produto.unidadeMedida)
      }
    }
  }, [watchedProdutoId, produtos, setValue])

  // Produtos disponíveis para seleção (excluindo o produto final)
  const produtosDisponiveis = produtos.filter(p => p.id !== watchedProdutoId)

  // Removido cálculo de custo (campo 'preco' não existe em Produto)

  const onSubmit = async (data: FichaTecnicaFormData) => {
    setLoading(true)
    try {
      const produtoFinal = produtos.find(p => p.id === data.produtoId)
      if (!produtoFinal) {
        throw new Error('Produto final não encontrado')
      }

      // Validar que todos os componentes foram selecionados
      const componentesInvalidos = data.componentes.filter(c => !c.produtoId || c.produtoId.trim() === '')
      if (componentesInvalidos.length > 0) {
        throw new Error('Todos os componentes devem ter um produto selecionado')
      }

      // Monta o DTO esperado pelo backend para criar/atualizar a ficha técnica do produto acabado
      const request = {
        id: produtoFinal.id,
        nome: produtoFinal.nome,
        desc: data.descricao,
        unidadeMedida: produtoFinal.unidadeMedida,
        componentes: data.componentes.map(c => ({
          materiaPrimaId: c.produtoId,
          quantidade: c.quantidade
        }))
      }

      console.log('Criando ficha técnica com request:', request)
      await criarProdutoAcabado(request)

      addNotification({
        type: 'success',
        title: ficha ? 'Ficha técnica atualizada' : 'Ficha técnica criada',
        message: `A ficha técnica de "${produtoFinal.nome}" foi ${ficha ? 'atualizada' : 'criada'} com sucesso.`
      })

      onSuccess()
    } catch (error) {
      console.error('Erro ao criar ficha técnica:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Não foi possível salvar a ficha técnica.'
      
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {ficha ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Produto Final *
                </label>
                <select
                  {...register('produtoId')}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    "border-gray-300 dark:border-gray-600",
                    errors.produtoId && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.unidadeMedida})
                    </option>
                  ))}
                </select>
                {errors.produtoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.produtoId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade Final *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('quantidadeFinal', { valueAsNumber: true })}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    "border-gray-300 dark:border-gray-600",
                    errors.quantidadeFinal && "border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.quantidadeFinal && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantidadeFinal.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                {...register('descricao')}
                rows={3}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                  "border-gray-300 dark:border-gray-600",
                  errors.descricao && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Descreva o processo de produção..."
              />
              {errors.descricao && (
                <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>
              )}
            </div>

            {/* Componentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Componentes
                </h3>
                <button
                  type="button"
                  onClick={() => append({ produtoId: '', quantidade: 1 })}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Produto
                        </label>
                        <select
                          {...register(`componentes.${index}.produtoId`)}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                            "bg-white dark:bg-gray-600 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-500",
                            errors.componentes?.[index]?.produtoId && "border-red-500 focus:ring-red-500"
                          )}
                        >
                          <option value="">Selecione um produto</option>
                          {produtosDisponiveis.map((produto) => (
                            <option key={produto.id} value={produto.id}>
                              {produto.nome} ({produto.unidadeMedida}) - Estoque: {produto.quantidadeEmEstoque}
                            </option>
                          ))}
                        </select>
                        {errors.componentes?.[index]?.produtoId && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.componentes[index]?.produtoId?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`componentes.${index}.quantidade`, { valueAsNumber: true })}
                          className={cn(
                            "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                            "bg-white dark:bg-gray-600 text-gray-900 dark:text-white",
                            "border-gray-300 dark:border-gray-500",
                            errors.componentes?.[index]?.quantidade && "border-red-500 focus:ring-red-500"
                          )}
                        />
                        {errors.componentes?.[index]?.quantidade && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.componentes[index]?.quantidade?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.componentes && (
                <p className="text-red-500 text-sm mt-2">{errors.componentes.message}</p>
              )}
            </div>

            {/* Resumo removido enquanto não há dados de custo disponíveis */}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Salvando...' : (ficha ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}