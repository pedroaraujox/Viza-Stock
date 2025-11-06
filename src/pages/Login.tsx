import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, LogIn, User, Lock, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema de validação com Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login, loading, error, clearError } = useAuthStore()
  const { theme } = useUIStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  // Limpar erros ao mudar de campo
  useEffect(() => {
    if (error) clearError()
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    // Tentar fazer login
    const success = await login(data.email, data.password)
    if (success) {
      navigate('/dashboard')
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setValue('email', demoEmail)
    setValue('password', demoPassword)
    trigger() // Re-validar após definir valores
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Container principal */}
      <div className="relative w-full max-w-md">
        {/* Card de login */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white text-2xl font-bold">V</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Viza Stock
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de Controle de Estoque
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={cn(
                    "block w-full pl-10 pr-3 py-3 border rounded-lg text-sm placeholder-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200",
                    errors.email 
                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 dark:border-red-600 dark:text-red-400"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  )}
                  placeholder="seu@email.com"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-lg text-sm placeholder-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200",
                    errors.password 
                      ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 dark:border-red-600 dark:text-red-400"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  )}
                  placeholder="••••••••"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={loading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Lembrar-me e Esqueci senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Lembrar-me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "transition-all duration-200 transform hover:scale-105 active:scale-95",
                loading && "opacity-75 cursor-not-allowed transform-none"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="-ml-1 mr-3 h-5 w-5" />
                  Entrar
                </>
              )}
            </button>

            {/* Erro geral */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
          </form>

          {/* Demonstração de credenciais */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
              Credenciais de demonstração:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('root@viza.com', 'root123')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">ROOT (Desenvolvedor)</p>
                    <p className="text-gray-500 dark:text-gray-400">root@viza.com</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@viza.com', 'admin123')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Administrador (Sistema)</p>
                    <p className="text-gray-500 dark:text-gray-400">admin@viza.com</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('gerente@viza.com', 'gerente123')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Gerente de Produção</p>
                    <p className="text-gray-500 dark:text-gray-400">gerente@viza.com</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('operador@viza.com', 'operador123')}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Operador de Estoque</p>
                    <p className="text-gray-500 dark:text-gray-400">operador@viza.com</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Viza Stock. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
