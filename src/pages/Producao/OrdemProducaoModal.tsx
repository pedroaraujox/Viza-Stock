import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Factory, AlertCircle } from 'lucide-react'
import { useProducaoStore } from '../../stores/producaoStore'
import { useNotifications } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

const ordemProducaoSchema = z.object({
  fichaTecnicaId: z.string().min(1, 'Selecione uma ficha técnica'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  observacoes: z.string().optional()
})

type OrdemProducaoFormData = z.infer<typeof ordemProducaoSchema>

interface OrdemProducaoModalProps {
  onClose: () => void
  onSuccess: () => void
}

export const OrdemProducaoModal: React.FC<OrdemProducaoModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { fichasTecnicas, fetchFichasTecnicas, verificarViabilidade, executarOrdem } = useProducaoStore()
  const { addNotification } = useNotifications()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<OrdemProducaoFormData>({
    resolver: zodResolver(ordemProducaoSchema),
    defaultValues: {
      fichaTecnicaId: '',
      quantidade: 1,
      observacoes: ''
    }
  })

  const watchedFichaTecnicaId = watch('fichaTecnicaId')
  const watchedQuantidade = watch('quantidade')

  useEffect(() => {
    // Evitar chamadas repetidas desnecessárias ao backend:
    // só busca se ainda não houver dados carregados.
    if (!fichasTecnicas || fichasTecnicas.length === 0) {
      fetchFichasTecnicas()
    }
  }, [fetchFichasTecnicas, fichasTecnicas])

  const fichaSelecionada = fichasTecnicas.find(f => f.id === watchedFichaTecnicaId)

  const onSubmit = async (data: OrdemProducaoFormData) => {
    try {
      // Verificar viabilidade antes de criar a ordem
      if (!fichaSelecionada) {
        addNotification({
          type: 'error',
          title: 'Ficha técnica inválida',
          message: 'Selecione uma ficha técnica válida.'
        })
        return
      }

      const viavel = await verificarViabilidade(fichaSelecionada.produtoAcabado.id, data.quantidade)
      
      if (!viavel) {
        addNotification({
          type: 'error',
          title: 'Produção inviável',
          message: 'Não há estoque suficiente para esta produção.'
        })
        return
      }

      // Executar ordem de produção
      await executarOrdem({
        produtoAcabadoId: fichaSelecionada.produtoAcabado.id,
        quantidadeAProduzir: data.quantidade
      })

      addNotification({
        type: 'success',
        title: 'Ordem criada',
        message: `Ordem de produção criada com sucesso.`
      })
      
      onSuccess()
    } catch {
      addNotification({
        type: 'error',
        title: 'Erro ao criar ordem',
        message: 'Não foi possível criar a ordem de produção.'
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nova Ordem de Produção
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Criar uma nova ordem baseada em ficha técnica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Seleção da Ficha Técnica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ficha Técnica *
            </label>
            <select
              {...register('fichaTecnicaId')}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                "border-gray-300 dark:border-gray-600",
                errors.fichaTecnicaId && "border-red-500 focus:ring-red-500"
              )}
            >
              <option value="">Selecione uma ficha técnica</option>
              {fichasTecnicas.map((ficha) => (
                <option key={ficha.id} value={ficha.id}>
                  {ficha.produtoAcabado.nome} - {ficha.produtoAcabado.unidadeMedida}
                </option>
              ))}
            </select>
            {errors.fichaTecnicaId && (
              <p className="text-red-500 text-sm mt-1">{errors.fichaTecnicaId.message}</p>
            )}
          </div>

          {/* Detalhes da Ficha Selecionada */}
          {fichaSelecionada && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                Detalhes da Ficha Técnica
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p><strong>Produto:</strong> {fichaSelecionada.produtoAcabado.nome}</p>
                <p><strong>Descrição:</strong> {fichaSelecionada.produtoAcabado.desc}</p>
                <p><strong>Unidade de medida:</strong> {fichaSelecionada.produtoAcabado.unidadeMedida}</p>
                <p><strong>Componentes:</strong> {fichaSelecionada.componentes.length} itens</p>
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantidade de Lotes *
            </label>
            <input
              type="number"
              min="1"
              {...register('quantidade', { valueAsNumber: true })}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                "border-gray-300 dark:border-gray-600",
                errors.quantidade && "border-red-500 focus:ring-red-500"
              )}
            />
            {errors.quantidade && (
              <p className="text-red-500 text-sm mt-1">{errors.quantidade.message}</p>
            )}
            
            {fichaSelecionada && watchedQuantidade > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total a produzir: {watchedQuantidade.toLocaleString('pt-BR')} {fichaSelecionada.produtoAcabado.unidadeMedida}
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              {...register('observacoes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observações sobre a produção..."
            />
          </div>

          {/* Aviso sobre verificação de estoque */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Verificação de Estoque</p>
                <p>
                  O sistema verificará automaticamente se há estoque suficiente 
                  dos componentes antes de criar a ordem de produção.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Ordem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}