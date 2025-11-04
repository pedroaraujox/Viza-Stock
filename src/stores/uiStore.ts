import { create } from 'zustand'
import type { Notification } from '../types'

interface UIStore {
  // Estado da interface
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  loading: boolean

  // Ações da sidebar
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Ações do tema
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void

  // Ações de notificações
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Ações de loading global
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Estado inicial
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  loading: false,

  // Ações da sidebar
  toggleSidebar: () => {
    set(state => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },

  // Ações do tema
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme })
    // Aplicar tema no documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  toggleTheme: () => {
    const { theme, setTheme } = get()
    setTheme(theme === 'light' ? 'dark' : 'light')
  },

  // Ações de notificações
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }

    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }))

    // Auto-remover notificação após 5 segundos (exceto erros)
    if (notification.type !== 'error') {
      setTimeout(() => {
        get().removeNotification(newNotification.id)
      }, 5000)
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Ações de loading global
  setLoading: (loading: boolean) => {
    set({ loading })
  }
}))

// Hooks utilitários para notificações
export const useNotifications = () => {
  const { addNotification } = useUIStore()

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message })
  }

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message })
  }

  const showWarning = (title: string, message: string) => {
    addNotification({ type: 'warning', title, message })
  }

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message })
  }

  return {
    // Exponha a função base para atender usos existentes
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

// Hook para responsividade
export const useResponsive = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  // Fechar sidebar automaticamente em telas pequenas
  const handleResize = () => {
    const currentState = useUIStore.getState().sidebarOpen
    const shouldBeOpen = window.innerWidth >= 768
    
    // Só atualizar se o estado realmente precisa mudar
    if (currentState !== shouldBeOpen) {
      setSidebarOpen(shouldBeOpen)
    }
  }

  return {
    sidebarOpen,
    setSidebarOpen,
    handleResize
  }
}