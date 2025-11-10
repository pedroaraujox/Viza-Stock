import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, AlertCircle, LogIn } from 'lucide-react'
import { cn } from '../lib/utils'
import { PasswordInput } from './PasswordInput'
import { LoadingSpinner } from './LoadingSpinner'

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

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading: boolean
  error: string | null
  onForgotPassword: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
  onForgotPassword
}) => {
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  React.useEffect(() => {
    if (error) {
      setError('root', { message: error })
    }
  }, [error, setError])

  const handleFormSubmitLocal = async (data: LoginFormData) => {
    await onSubmit({ ...data, rememberMe })
  }

  return (
    <motion.form
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      onSubmit={handleFormSubmit(handleFormSubmitLocal)}
      className="space-y-6"
      noValidate
    >
      {/* Campo Email */}
      <motion.div variants={fadeInUp}>
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
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email && (
          <motion.p 
            id="email-error" 
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.email.message}
          </motion.p>
        )}
      </motion.div>

      {/* Campo Senha */}
      <motion.div variants={fadeInUp}>
        <PasswordInput
          label="Senha"
          error={errors.password?.message}
          {...register('password')}
          disabled={isLoading}
        />
      </motion.div>

      {/* Lembrar-me e Esqueci senha */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            disabled={isLoading}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Lembrar-me
          </label>
        </div>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          disabled={isLoading}
        >
          Esqueceu a senha?
        </button>
      </motion.div>

      {/* Erro geral */}
      <AnimatePresence>
        {errors.root && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-800 dark:text-red-200">{errors.root.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de Login */}
      <motion.div variants={fadeInUp}>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white",
            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "transition-all duration-200 transform hover:scale-105 active:scale-95",
            isLoading && "opacity-75 cursor-not-allowed transform-none"
          )}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="mr-3" size="sm" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="-ml-1 mr-3 h-5 w-5" />
              Entrar
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  )
}