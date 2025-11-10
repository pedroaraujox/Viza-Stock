import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { LoginForm } from './LoginForm'
import { ThemeToggle } from './ThemeToggle'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { LoadingSpinner } from './LoadingSpinner'
import { useAuthStore } from '../stores/authStore'

interface LoginContainerProps {
  onLoginSuccess: (user: any) => void
}

export const LoginContainer: React.FC<LoginContainerProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)

  const handleLogin = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await useAuthStore.getState().login(data.email, data.password)
      if (success) {
        toast.success('Login realizado com sucesso!')
        const user = useAuthStore.getState().user
        onLoginSuccess(user)
      } else {
        setError(useAuthStore.getState().error || 'Credenciais inválidas. Verifique seu email e senha.')
        toast.error('Erro ao fazer login')
      }
      
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu email e senha.')
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (email: string) => {
    // Simular chamada de API para recuperação de senha
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simular notificação ao administrador
    toast.success('Solicitação enviada! Um administrador será notificado.')
    
    // Aqui você implementaria a lógica real de notificação ao root
    console.log(`Notificação enviada ao root: Solicitação de recuperação de senha para ${email}`)
  }

  const backgroundVariants = {
    animate: {
      background: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      ],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const floatingAnimation = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      variants={backgroundVariants}
      animate="animate"
    >
      {/* Background animado com partículas */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white bg-opacity-30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Container principal */}
      <motion.div
        className="relative w-full max-w-md"
        variants={floatingAnimation}
        animate="animate"
      >
        {/* Card de login */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300
          }}
        >
          {/* Header com logo e tema toggle */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1 text-center">
              <motion.div
                className="flex justify-center mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="text-white text-2xl font-bold">V</div>
                </div>
              </motion.div>
              <motion.h1 
                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Viza Stock
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sistema de Controle de Estoque
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Formulário de login */}
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
            onForgotPassword={() => setIsForgotPasswordModalOpen(true)}
          />

          {/* Versão do sistema */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Versão 2.0.0
            </p>
          </motion.div>
        </motion.div>

        {/* Rodapé */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-white text-opacity-80">
            © 2024 Viza Stock. Todos os direitos reservados.
          </p>
        </motion.div>
      </motion.div>

      {/* Modal de recuperação de senha */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onSubmit={handleForgotPassword}
      />

      {/* Sistema de notificações */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </motion.div>
  )
}