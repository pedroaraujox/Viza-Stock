import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { describe, it, expect, vi } from 'vitest'

// Mock do useAuthStore
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn().mockResolvedValue(true),
    loading: false,
    error: null,
    clearError: vi.fn()
  })
}))

// Mock do useUIStore
vi.mock('../stores/uiStore', () => ({
  useUIStore: () => ({
    theme: 'light'
  })
}))

// Mock do useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Login Component', () => {
  it('renders login form with all elements', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    // Verificar se os elementos principais estão presentes
    expect(screen.getByText('Viza Stock')).toBeInTheDocument()
    expect(screen.getByText('Sistema de Controle de Estoque')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /lembrar-me/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } })

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const passwordInput = screen.getByLabelText('Senha')
    const toggleButton = screen.getByLabelText(/mostrar senha/i)

    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('auto-fills demo credentials', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement
    // Clicar no botão de demo para preencher automaticamente
    const demoAdminButton = screen.getByText(/Administrador/i)
    fireEvent.click(demoAdminButton)

    // Verificar se os campos foram preenchidos após clicar
    expect(emailInput.value).toBe('admin@viza.com')
    expect(passwordInput.value).toBe('admin123')
  })

  it('has demo login buttons for different user roles', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByText(/Administrador/i)).toBeInTheDocument()
    expect(screen.getByText('Gerente de Produção')).toBeInTheDocument()
    expect(screen.getByText('Operador de Estoque')).toBeInTheDocument()
  })
})