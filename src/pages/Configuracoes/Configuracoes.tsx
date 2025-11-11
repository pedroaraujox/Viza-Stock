import React, { useState } from 'react'
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Save,
  Mail,
  Phone,
  Building,
  MapPin
} from 'lucide-react'
import { Users as UsersIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUIStore } from '../../stores/uiStore'
import { useNotifications } from '../../stores/uiStore'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { GerenciarUsuarios } from './GerenciarUsuarios'
import { useSettingsStore } from '../../stores/settingsStore'

const perfilSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cargo: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  empresa: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres')
})

type PerfilForm = z.infer<typeof perfilSchema>

export const Configuracoes: React.FC = () => {
  const { theme, setTheme } = useUIStore()
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'notificacoes' | 'sistema' | 'usuarios'>('perfil')
  const { user } = useAuthStore()
  const canManageUsers = user?.systemRole === 'ROOT' || user?.systemRole === 'ADMINISTRADOR'
  const {
    getGlobal,
    setGlobalVoiceOnNewOrder,
    loadGlobalFromBackend,
    saveGlobalToBackend
  } = useSettingsStore()

  // Carregar preferência global ao abrir a página (qualquer usuário)
  React.useEffect(() => {
    loadGlobalFromBackend()
  }, [loadGlobalFromBackend])

  const perfilForm = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: 'João Silva',
      email: 'joao.silva@viza.com.br',
      telefone: '(11) 99999-9999',
      cargo: 'Gerente de Estoque',
      empresa: 'Viza Indústria',
      endereco: 'Rua das Indústrias, 123 - São Paulo, SP'
    }
  })


  const [configuracoes, setConfiguracoes] = useState({
    notificacoes: {
      estoqueMinimo: true,
      novasProdutos: true,
      ordensProducao: true,
      relatorios: false,
      email: true,
      push: false
    },
    sistema: {
      autoBackup: true,
      logDetalhado: false,
      manutencaoAutomatica: true,
      compressaoImagens: true
    }
  })

  const onSubmitPerfil = (data: PerfilForm) => {
    console.log('Atualizando perfil:', data)
    addNotification({
      type: 'success',
      title: 'Perfil atualizado',
      message: 'Suas informações foram atualizadas com sucesso!'
    })
  }

  const salvarConfiguracoes = () => {
    console.log('Salvando configurações:', configuracoes)
    addNotification({
      type: 'success',
      title: 'Configurações salvas',
      message: 'Suas preferências foram salvas com sucesso!'
    })
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    ...(canManageUsers ? [{ id: 'usuarios', label: 'Gerenciar Usuários', icon: UsersIcon }] : [])
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Navegação */}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}

            {/* Toggle de Voz dentro do nav (visível somente para ROOT) */}
            {user?.systemRole === 'ROOT' && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Voz para novas ordens</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">Somente ROOT</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={getGlobal().voiceOnNewOrder}
                    onChange={(e) => {
                      const enabled = e.target.checked
                      setGlobalVoiceOnNewOrder(enabled)
                      saveGlobalToBackend()
                      addNotification({
                        type: 'success',
                        title: enabled ? 'Voz habilitada' : 'Voz desabilitada',
                        message: 'Preferência atualizada com sucesso.'
                      })
                    }}
                  />
                  <span className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer transition-colors relative">
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></span>
                  </span>
                </label>
              </div>
            )}
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {activeTab === 'perfil' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informações do Perfil
                </h2>
              </div>

              <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...perfilForm.register('nome')}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {perfilForm.formState.errors.nome && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...perfilForm.register('email')}
                        type="email"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {perfilForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...perfilForm.register('telefone')}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {perfilForm.formState.errors.telefone && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.telefone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cargo
                    </label>
                    <input
                      {...perfilForm.register('cargo')}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {perfilForm.formState.errors.cargo && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.cargo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Empresa
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...perfilForm.register('empresa')}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {perfilForm.formState.errors.empresa && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.empresa.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...perfilForm.register('endereco')}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {perfilForm.formState.errors.endereco && (
                      <p className="text-red-500 text-sm mt-1">{perfilForm.formState.errors.endereco.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configurações do Sistema</h2>
              </div>

              {/* Preferência de voz: somente ROOT */}
              {user?.systemRole === 'ROOT' && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recursos de Voz</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Controle de anúncio por voz quando novas ordens de produção são criadas.</p>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Voz para novas ordens</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Quando habilitado, o sistema anunciará por voz a criação de novas ordens (apenas para ROOT).</p>
                    </div>
                    {/* Toggle */}
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={getGlobal().voiceOnNewOrder}
                        onChange={(e) => {
                          const enabled = e.target.checked
                          setGlobalVoiceOnNewOrder(enabled)
                          saveGlobalToBackend()
                          addNotification({
                            type: 'success',
                            title: enabled ? 'Voz habilitada' : 'Voz desabilitada',
                            message: 'Preferência atualizada com sucesso.'
                          })
                        }}
                      />
                      <span className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer transition-colors relative">
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Outras configurações do sistema existentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white">Backup Automático</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Mantém cópias de segurança do banco periodicamente.</p>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <p className="font-medium text-gray-900 dark:text-white">Logs Detalhados</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Habilita logs mais verbosos para depuração.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              {/* Tema */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Palette className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Aparência
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema
                    </label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors",
                          theme === 'light'
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        Claro
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors",
                          theme === 'dark'
                            ? "bg-blue-50 border-blue-200 text-blue-600"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        Escuro
                      </button>
                    </div>
                  </div>
              </div>
            </div>

              {/* Alterar Senha removido conforme solicitado */}
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preferências de Notificação
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Tipos de Notificação
                  </h3>
                  <div className="space-y-4">
                    {Object.entries({
                      estoqueMinimo: 'Alertas de estoque mínimo',
                      novasProdutos: 'Novos produtos cadastrados',
                      ordensProducao: 'Ordens de produção',
                      relatorios: 'Relatórios automáticos'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoes[key as keyof typeof configuracoes.notificacoes]}
                            onChange={(e) => setConfiguracoes(prev => ({
                              ...prev,
                              notificacoes: {
                                ...prev.notificacoes,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Canais de Notificação
                  </h3>
                  <div className="space-y-4">
                    {Object.entries({
                      email: 'Notificações por email',
                      push: 'Notificações push no navegador'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configuracoes.notificacoes[key as keyof typeof configuracoes.notificacoes]}
                            onChange={(e) => setConfiguracoes(prev => ({
                              ...prev,
                              notificacoes: {
                                ...prev.notificacoes,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={salvarConfiguracoes}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Preferências</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurações do Sistema
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Backup e Manutenção
                  </h3>
                  <div className="space-y-4">
                    {Object.entries({
                      autoBackup: 'Backup automático diário',
                      logDetalhado: 'Log detalhado de operações',
                      manutencaoAutomatica: 'Manutenção automática do banco',
                      compressaoImagens: 'Compressão automática de imagens'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">{label}</span>
                          {key === 'autoBackup' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Backup realizado às 02:00 todos os dias
                            </p>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={configuracoes.sistema[key as keyof typeof configuracoes.sistema]}
                            onChange={(e) => setConfiguracoes(prev => ({
                              ...prev,
                              sistema: {
                                ...prev.sistema,
                                [key]: e.target.checked
                              }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Informações do Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Versão do Sistema</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">v2.1.0</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Último Backup</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">Hoje, 02:00</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Espaço Utilizado</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">2.3 GB</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">15 dias</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={salvarConfiguracoes}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'usuarios' && canManageUsers && (
            <GerenciarUsuarios />
          )}
        </div>
      </div>
    </div>
  )
}