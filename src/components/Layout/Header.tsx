import React from 'react'
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Sun, 
  Moon,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react'
import { useUIStore, useNotifications } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export const Header: React.FC = () => {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    theme, 
    toggleTheme, 
    notifications 
  } = useUIStore()
  
  const { showInfo } = useNotifications()
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)

  const { logout, user } = useAuthStore()
  
  const handleLogout = () => {
    logout()
    showInfo('Logout', 'Você foi desconectado do sistema')
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Lado Esquerdo */}
        <div className="flex items-center space-x-4">
          {/* Botão do Menu */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Barra de Pesquisa */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar produtos, ordens..."
                className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center space-x-2">
          {/* Botão de Pesquisa Mobile */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Toggle Tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notificações"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Notificações
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
                          !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            notification.type === 'success' && "bg-green-500",
                            notification.type === 'error' && "bg-red-500",
                            notification.type === 'warning' && "bg-yellow-500",
                            notification.type === 'info' && "bg-blue-500"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Ver todas as notificações
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.nome ?? 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email ?? ''}
                </p>
              </div>
            </button>

            {/* Dropdown do Usuário */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-2">
                  {user && (
                    <div className="px-3 py-2 mb-2 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      Acesso: <span className="font-semibold">{user.systemRole}</span>
                    </div>
                  )}
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fechar dropdowns ao clicar fora */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}