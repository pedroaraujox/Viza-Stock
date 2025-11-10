import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  FileText, 
  Factory, 
  BarChart3, 
  Settings,
  X,
  ChevronLeft
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Visão geral do sistema'
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/produtos',
    description: 'Gestão de produtos'
  },
  {
    title: 'Estoque',
    icon: Warehouse,
    path: '/estoque',
    description: 'Controle de estoque'
  },
  {
    title: 'Fichas Técnicas',
    icon: FileText,
    path: '/fichas-tecnicas',
    description: 'Receitas de produção'
  },
  {
    title: 'Produção',
    icon: Factory,
    path: '/producao',
    description: 'Ordens de produção'
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    path: '/relatorios',
    description: 'Análises e relatórios'
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    description: 'Configurações do sistema'
  }
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out",
        "w-64 lg:w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Viza Stock
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sistema de Estoque
              </p>
            </div>
          </div>

          {/* Botão de fechar (mobile) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Botão de colapsar (desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className={cn(
              "w-5 h-5 text-gray-500 transition-transform duration-200",
              !sidebarOpen && "rotate-180"
            )} />
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                )} />
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isActive && "font-semibold"
                  )}>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                </div>

                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Sistema Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Conectado ao servidor
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}