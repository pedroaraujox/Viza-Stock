import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, SystemRole } from '../stores/authStore'

interface RequireSystemRolesProps {
  allowed: SystemRole[]
  children: React.ReactNode
}

export const RequireSystemRoles: React.FC<RequireSystemRolesProps> = ({ allowed, children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user || !allowed.includes(user.systemRole)) {
    // Redireciona para o dashboard se o usuário não tiver permissão
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}