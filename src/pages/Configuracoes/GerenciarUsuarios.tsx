import React, { useMemo, useState } from 'react'
import { useAuthStore, User, SystemRole } from '../../stores/authStore'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, UserPlus, Edit, Eye, ShieldCheck } from 'lucide-react'

type Department = 'FATURAMENTO' | 'EMBALADORA' | 'EXTRUSORA' | 'TI' | 'DIRETORIA'
type ManagedUser = User & { department: Department }

const createUserSchema = z.object({
  nome: z.string().min(2, 'Informe um nome válido'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo de 6 caracteres'),
  department: z.enum(['FATURAMENTO', 'EMBALADORA', 'EXTRUSORA', 'TI', 'DIRETORIA'], {
    required_error: 'Selecione um departamento'
  }),
  systemRole: z.enum(['ROOT', 'ADMINISTRADOR', 'PADRAO'], {
    required_error: 'Selecione o nível de acesso do sistema'
  })
})

type CreateUserForm = z.infer<typeof createUserSchema>

export const GerenciarUsuarios: React.FC = () => {
  const { user: currentUser } = useAuthStore()

  const [users, setUsers] = useState<ManagedUser[]>([
    { id: '0', nome: 'Root (Desenvolvedor)', email: 'root@viza.com', role: 'ADMINISTRADOR', systemRole: 'ROOT', department: 'TI' },
    { id: '3', nome: 'Administrador do Sistema', email: 'admin@viza.com', role: 'ADMINISTRADOR', systemRole: 'ADMINISTRADOR', department: 'TI' },
    { id: '2', nome: 'Gerente de Produção', email: 'gerente@viza.com', role: 'GERENTE_PRODUCAO', systemRole: 'PADRAO', department: 'EXTRUSORA' },
    { id: '1', nome: 'Operador de Estoque', email: 'operador@viza.com', role: 'OPERADOR_ESTOQUE', systemRole: 'PADRAO', department: 'EMBALADORA' }
  ])

  const [viewUser, setViewUser] = useState<ManagedUser | null>(null)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)

  const canCreateSystemRoles: SystemRole[] = useMemo(() => {
    if (currentUser?.systemRole === 'ROOT') return ['ROOT', 'ADMINISTRADOR', 'PADRAO']
    if (currentUser?.systemRole === 'ADMINISTRADOR') return ['PADRAO']
    return []
  }, [currentUser?.systemRole])

  const canEditUser = (target: ManagedUser) => {
    if (currentUser?.systemRole === 'ROOT') return true
    if (currentUser?.systemRole === 'ADMINISTRADOR') return target.systemRole === 'PADRAO'
    return false
  }

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      department: 'FATURAMENTO',
      systemRole: currentUser?.systemRole === 'ADMINISTRADOR' ? 'PADRAO' : 'PADRAO'
    }
  })

  const onCreateUser = (data: CreateUserForm) => {
    // Restringir opções não permitidas no próprio submit
    if (!canCreateSystemRoles.includes(data.systemRole)) {
      form.setError('systemRole', { type: 'manual', message: 'Você não tem permissão para criar este nível de acesso.' })
      return
    }
    const newUser: ManagedUser = {
      id: String(Date.now()),
      nome: data.nome,
      email: data.email,
      // Papel funcional removido do formulário: definir padrão
      role: 'OPERADOR_ESTOQUE',
      department: data.department,
      systemRole: data.systemRole
    }
    setUsers(prev => [newUser, ...prev])
    form.reset()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gerenciar Usuários
        </h2>
      </div>

      {/* Aviso de permissões */}
      <div className="mb-6 flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {currentUser?.systemRole === 'ROOT' && (
            <p>Como ROOT, você pode criar e editar qualquer tipo de usuário (ROOT, ADMINISTRADOR e PADRÃO).</p>
          )}
          {currentUser?.systemRole === 'ADMINISTRADOR' && (
            <>
              <p>Como Administrador do sistema, você pode criar usuários PADRÃO e editar todas as informações de usuários PADRÃO.</p>
              <p>Usuários ADMINISTRADORES e ROOT são somente leitura para você.</p>
            </>
          )}
        </div>
      </div>

      {/* Formulário de criação */}
      <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input {...form.register('nome')} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            {form.formState.errors.nome && <p className="text-red-500 text-xs mt-1">{form.formState.errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" {...form.register('email')} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            {form.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input type="password" {...form.register('senha')} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            {form.formState.errors.senha && <p className="text-red-500 text-xs mt-1">{form.formState.errors.senha.message}</p>}
          </div>
          {/* Campo "Papel (Funcional)" removido conforme solicitado */}
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select {...form.register('department')} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600">
              <option value="FATURAMENTO">Faturamento</option>
              <option value="EMBALADORA">Embaladora</option>
              <option value="EXTRUSORA">Extrusora</option>
              <option value="TI">TI</option>
              <option value="DIRETORIA">Diretoria</option>
            </select>
            {form.formState.errors.department && <p className="text-red-500 text-xs mt-1">{form.formState.errors.department.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nível de acesso do sistema</label>
            <select {...form.register('systemRole')} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600">
              <option value="PADRAO" disabled={!canCreateSystemRoles.includes('PADRAO')}>Padrão</option>
              <option value="ADMINISTRADOR" disabled={!canCreateSystemRoles.includes('ADMINISTRADOR')}>Administrador (Sistema)</option>
              <option value="ROOT" disabled={!canCreateSystemRoles.includes('ROOT')}>ROOT (Desenvolvedor)</option>
            </select>
            {form.formState.errors.systemRole && <p className="text-red-500 text-xs mt-1">{form.formState.errors.systemRole.message}</p>}
          </div>
        </div>
        <button type="submit" className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Criar usuário
        </button>
      </form>

      {/* Lista de usuários */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Acesso (Sistema)</th>
              <th className="py-2 pr-4">Departamento</th>
              <th className="py-2 pr-4">Papel (Funcional)</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const editable = canEditUser(u)
              return (
                <tr key={u.id} className="border-b dark:border-gray-700">
                  <td className="py-2 pr-4">{u.nome}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.systemRole}</td>
                  <td className="py-2 pr-4">{u.department}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">
                    <button
                      onClick={() => setViewUser(u)}
                      className="inline-flex items-center px-2 py-1 mr-2 rounded border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualizar
                    </button>
                    <button
                      disabled={!editable}
                      onClick={() => editable && setEditUser(u)}
                      className={`inline-flex items-center px-2 py-1 rounded ${editable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Modal de Visualização */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewUser(null)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Detalhes do Usuário</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Nome:</span> {viewUser.nome}</p>
              <p><span className="font-medium">Email:</span> {viewUser.email}</p>
              <p><span className="font-medium">Acesso (Sistema):</span> {viewUser.systemRole}</p>
              <p><span className="font-medium">Departamento:</span> {viewUser.department}</p>
              <p><span className="font-medium">Papel (Funcional):</span> {viewUser.role}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex items-center px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setViewUser(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditUser(null)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Usuário</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  value={editUser.nome}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, nome: e.target.value } as ManagedUser : prev)}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, email: e.target.value } as ManagedUser : prev)}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departamento</label>
                <select
                  value={editUser.department}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, department: e.target.value as Department } as ManagedUser : prev)}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="FATURAMENTO">Faturamento</option>
                  <option value="EMBALADORA">Embaladora</option>
                  <option value="EXTRUSORA">Extrusora</option>
                  <option value="TI">TI</option>
                  <option value="DIRETORIA">Diretoria</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Acesso (Sistema)</label>
                <select
                  value={editUser.systemRole}
                  onChange={(e) => setEditUser(prev => prev ? { ...prev, systemRole: e.target.value as SystemRole } as ManagedUser : prev)}
                  className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="PADRAO" disabled={!canCreateSystemRoles.includes('PADRAO')}>Padrão</option>
                  <option value="ADMINISTRADOR" disabled={!canCreateSystemRoles.includes('ADMINISTRADOR')}>Administrador (Sistema)</option>
                  <option value="ROOT" disabled={!canCreateSystemRoles.includes('ROOT')}>ROOT (Desenvolvedor)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="inline-flex items-center px-3 py-2 rounded border dark:border-gray-600"
                onClick={() => setEditUser(null)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  if (!editUser) return
                  // Atualiza lista
                  setUsers(prev => prev.map(usr => usr.id === editUser.id ? editUser : usr))
                  setEditUser(null)
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}