import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SystemRole = 'ROOT' | 'ADMINISTRADOR' | 'PADRAO'

export interface User {
  id: string
  nome: string
  email: string
  // Papel funcional já existente na aplicação (operador, gerente, administrador funcional)
  role: 'OPERADOR_ESTOQUE' | 'GERENTE_PRODUCAO' | 'ADMINISTRADOR'
  // Nível de acesso do sistema (hierarquia: ROOT > ADMINISTRADOR > PADRÃO)
  systemRole: SystemRole
}

interface AuthStore {
  // Estado
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null

  // Ações
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Dados mockados para simulação de login
const MOCK_USERS = [
  // Usuário ROOT (desenvolvedores) – controle total
  {
    id: '0',
    nome: 'Root (Desenvolvedor)',
    email: 'root@viza.com',
    senha: 'root123',
    role: 'ADMINISTRADOR' as const, // papel funcional
    systemRole: 'ROOT' as const
  },
  // Administrador do sistema – tudo, exceto criar ROOT/ADMINISTRADOR
  {
    id: '3',
    nome: 'Administrador do Sistema',
    email: 'admin@viza.com',
    senha: 'admin123',
    role: 'ADMINISTRADOR' as const,
    systemRole: 'ADMINISTRADOR' as const
  },
  // Perfis padrão (operacional) – restrições a definir
  {
    id: '1',
    nome: 'Operador de Estoque',
    email: 'operador@viza.com',
    senha: 'operador123',
    role: 'OPERADOR_ESTOQUE' as const,
    systemRole: 'PADRAO' as const
  },
  {
    id: '2',
    nome: 'Gerente de Produção',
    email: 'gerente@viza.com',
    senha: 'gerente123',
    role: 'GERENTE_PRODUCAO' as const,
    systemRole: 'PADRAO' as const
  }
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login com validação mockada
      login: async (email: string, senha: string) => {
        const { setLoading, setError } = get()
        
        try {
          setLoading(true)
          setError(null)

          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Validar credenciais
          const user = MOCK_USERS.find(u => u.email === email && u.senha === senha)
          
          if (!user) {
            setError('Email ou senha inválidos')
            setLoading(false)
            return false
          }

          // Gerar token mockado
          const token = `mock-token-${user.id}-${Date.now()}`
          
          // Atualizar estado
          set({
            user: {
              id: user.id,
              nome: user.nome,
              email: user.email,
              role: user.role,
              systemRole: user.systemRole
            },
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          })

          return true
        } catch (error) {
          setError('Erro ao fazer login. Tente novamente.')
          setLoading(false)
          return false
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        })
      },

      // Setters auxiliares
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'viza-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Hook utilitário para verificar permissões
export const usePermissions = () => {
  const { user } = useAuthStore()

  // Verificação por papéis funcionais existentes
  const canAccess = (allowedRoles: Array<User['role']>) => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  const isAdmin = () => user?.role === 'ADMINISTRADOR'
  const isGerente = () => user?.role === 'GERENTE_PRODUCAO'
  const isOperador = () => user?.role === 'OPERADOR_ESTOQUE'

  // Verificação por hierarquia de acesso do sistema
  const canAccessSystem = (allowedSystemRoles: SystemRole[]) => {
    if (!user) return false
    return allowedSystemRoles.includes(user.systemRole)
  }

  const isRoot = () => user?.systemRole === 'ROOT'
  const isSystemAdmin = () => user?.systemRole === 'ADMINISTRADOR'
  const isPadrao = () => user?.systemRole === 'PADRAO'

  return {
    // funcional
    canAccess,
    isAdmin,
    isGerente,
    isOperador,
    userRole: user?.role,
    // sistema
    canAccessSystem,
    isRoot,
    isSystemAdmin,
    isPadrao,
    userSystemRole: user?.systemRole
  }
}