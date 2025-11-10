import React, { useEffect, useMemo, useState } from 'react'
import { useAuthStore, User, SystemRole } from '../../stores/authStore'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, UserPlus, Edit, Eye, ShieldCheck, Search, Trash } from 'lucide-react'
import { useUserStore, ManagedUser, Department } from '../../stores/userStore'

// Tipos agora vêm do store para evitar duplicidade

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
  const { users, addUser, updateUser, deleteUser, initDefaults } = useUserStore()

  const [viewUser, setViewUser] = useState<ManagedUser | null>(null)
  const [editUser, setEditUser] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)
  const [query, setQuery] = useState('')

  // Inicializa lista padrão somente se não houver dados persistidos
  useEffect(() => {
    initDefaults()
  }, [initDefaults])

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

  const canDeleteUser = (target: ManagedUser) => {
    // Permissões de exclusão:
    // - ROOT: pode excluir qualquer usuário, exceto a si próprio
    // - ADMINISTRADOR: pode excluir apenas usuários PADRÃO, exceto a si próprio
    if (!currentUser) return false
    if (currentUser.systemRole === 'ROOT') {
      return target.id !== currentUser.id
    }
    if (currentUser.systemRole === 'ADMINISTRADOR') {
      return target.systemRole === 'PADRAO' && target.id !== currentUser.id
    }
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
    addUser(newUser)
    form.reset()
  }

  // Filtro de busca simples por nome/email/departamento/role
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.nome, u.email, u.department, u.role, u.systemRole]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [users, query])

  // Badges reutilizáveis para melhorar legibilidade e estética
  const SystemRoleBadge: React.FC<{ role: SystemRole }> = ({ role }) => {
    const styles: Record<SystemRole, string> = {
      ROOT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      ADMINISTRADOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      PADRAO: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${styles[role]}`}>{role}</span>
    )
  }

  const DepartmentBadge: React.FC<{ dep: Department }> = ({ dep }) => (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800">
      {dep}
    </span>
  )

  const RoleBadge: React.FC<{ role: ManagedUser['role'] }> = ({ role }) => (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
      {role}
    </span>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gerenciar Usuários</h2>
        </div>
        {/* Busca */}
        <div className="w-full md:w-80">
          <label htmlFor="user-search" className="sr-only">Buscar usuário</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="user-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, email, departamento ou papel"
              className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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
              <p>Como Administrador do sistema, você pode criar usuários PADRÃO e editar e excluir usuários PADRÃO.</p>
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
            <tr className="text-left border-b dark:border-gray-700">
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Nome</th>
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Acesso (Sistema)</th>
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Departamento</th>
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Papel (Funcional)</th>
              <th className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const editable = canEditUser(u)
              return (
                <tr key={u.id} className="border-b dark:border-gray-700 odd:bg-gray-50 dark:odd:bg-gray-700/40 hover:bg-gray-100/70 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{u.nome}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="py-3 px-4"><SystemRoleBadge role={u.systemRole} /></td>
                  <td className="py-3 px-4"><DepartmentBadge dep={u.department} /></td>
                  <td className="py-3 px-4"><RoleBadge role={u.role} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="Visualizar"
                        aria-label={`Visualizar usuário ${u.nome}`}
                        onClick={() => setViewUser(u)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Visualizar</span>
                      </button>
                      <button
                        title={editable ? 'Editar' : 'Sem permissão para editar'}
                        aria-label={`Editar usuário ${u.nome}`}
                        disabled={!editable}
                        onClick={() => editable && setEditUser(u)}
                        className={`inline-flex items-center justify-center h-8 px-3 rounded-md ${editable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                      >
                        <Edit className="w-4 h-4" />
                        <span className="ml-2 hidden sm:inline">Editar</span>
                      </button>
                      <button
                        title={canDeleteUser(u) ? 'Excluir' : 'Somente usuários ROOT podem excluir'}
                        aria-label={`Excluir usuário ${u.nome}`}
                        disabled={!canDeleteUser(u)}
                        onClick={() => canDeleteUser(u) && setDeleteTarget(u)}
                        className={`inline-flex items-center justify-center h-8 px-3 rounded-md ${canDeleteUser(u) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                      >
                        <Trash className="w-4 h-4" />
                        <span className="ml-2 hidden sm:inline">Excluir</span>
                      </button>
                    </div>
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
                  updateUser(editUser)
                  setEditUser(null)
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Excluir Usuário</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Tem certeza que deseja excluir o usuário <span className="font-semibold">{deleteTarget.nome}</span>? Esta ação não pode ser desfeita.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="inline-flex items-center px-3 py-2 rounded border dark:border-gray-600"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (!deleteTarget) return
                  deleteUser(deleteTarget.id)
                  setDeleteTarget(null)
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}