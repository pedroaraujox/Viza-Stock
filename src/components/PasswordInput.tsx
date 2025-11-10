import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '../lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, label = "Senha", className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || 'password'

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? "text" : "password"}
            className={cn(
              "block w-full pl-10 pr-10 py-3 border rounded-lg text-sm placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-all duration-200",
              error 
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 dark:border-red-600 dark:text-red-400"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              className
            )}
            placeholder="••••••••"
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            {/* Substitui símbolo Unicode por caractere ASCII para evitar problemas de build em ambientes restritos */}
            <span className="inline-block w-4 h-4 mr-1 text-center" aria-hidden="true">!</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'