import React from 'react'
import { X, BookOpen } from 'lucide-react'

export interface TemplateComponente {
  nome: string
  quantidade: number
  unidade: string
}

export interface TemplateFichaTecnica {
  id: string
  nomeProduto: string
  unidadeProduto: string
  descricao: string
  componentes: TemplateComponente[]
}

interface TemplatesModalProps {
  onClose: () => void
  onUseTemplate?: (template: TemplateFichaTecnica) => void
}

// Templates estáticos de exemplo
export const templates: TemplateFichaTecnica[] = [
  {
    id: 'tpl-01',
    nomeProduto: 'Bolo de Milho',
    unidadeProduto: 'UN',
    descricao: 'Receita padrão para bolo de milho simples.',
    componentes: [
      { nome: 'Milho', quantidade: 2, unidade: 'X' },
      { nome: 'Farinha de Trigo', quantidade: 0.5, unidade: 'KG' },
      { nome: 'Açúcar', quantidade: 0.3, unidade: 'KG' },
      { nome: 'Ovos', quantidade: 3, unidade: 'UN' }
    ]
  },
  {
    id: 'tpl-02',
    nomeProduto: 'Pão Caseiro',
    unidadeProduto: 'UN',
    descricao: 'Massa básica de pão caseiro.',
    componentes: [
      { nome: 'Farinha de Trigo', quantidade: 1, unidade: 'KG' },
      { nome: 'Fermento Biológico', quantidade: 10, unidade: 'G' },
      { nome: 'Água', quantidade: 600, unidade: 'ML' },
      { nome: 'Sal', quantidade: 10, unidade: 'G' }
    ]
  },
  {
    id: 'tpl-03',
    nomeProduto: 'Biscoito de Milho',
    unidadeProduto: 'PACOTE',
    descricao: 'Massa para biscoito crocante de milho.',
    componentes: [
      { nome: 'Milho', quantidade: 1, unidade: 'X' },
      { nome: 'Farinha de Trigo', quantidade: 0.3, unidade: 'KG' },
      { nome: 'Manteiga', quantidade: 100, unidade: 'G' },
      { nome: 'Ovos', quantidade: 2, unidade: 'UN' }
    ]
  },
  {
    id: 'tpl-04',
    nomeProduto: 'Massa de Lasanha',
    unidadeProduto: 'KG',
    descricao: 'Base para massa de lasanha.',
    componentes: [
      { nome: 'Farinha de Trigo', quantidade: 0.8, unidade: 'KG' },
      { nome: 'Ovos', quantidade: 4, unidade: 'UN' },
      { nome: 'Sal', quantidade: 5, unidade: 'G' }
    ]
  }
]

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ onClose, onUseTemplate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Templates de Fichas Técnicas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tpl.nomeProduto}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Unidade: {tpl.unidadeProduto}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tpl.descricao}</p>
                </div>
                <div className="px-4 pb-4">
                  <div className="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2">Componentes</div>
                  <ul className="space-y-2">
                    {tpl.componentes.map((c, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2">
                        <span className="text-gray-800 dark:text-gray-100">{c.nome}</span>
                        <span className="text-gray-600 dark:text-gray-300">{c.quantidade} {c.unidade}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Botão para usar o template */}
                  <div className="mt-4">
                    <button
                      className="w-full px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      onClick={() => onUseTemplate?.(tpl)}
                    >
                      Usar este Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Dica: clique em "Usar este Template" para iniciar uma nova ficha técnica com os dados preenchidos. Você poderá ajustar os produtos e quantidades antes de salvar.
          </div>
        </div>
      </div>
    </div>
  )
}