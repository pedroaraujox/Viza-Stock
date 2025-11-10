import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginContainer } from '../components/LoginContainer'

export function Login() {
  const navigate = useNavigate()

  const handleLoginSuccess = (_user: any) => {
    navigate('/dashboard')
  }

  return <LoginContainer onLoginSuccess={handleLoginSuccess} />
}
