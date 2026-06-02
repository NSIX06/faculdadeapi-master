'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { usuarios as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, PerfilBadge, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Usuario, Perfil, CreateUsuarioRequest, UpdateUsuarioRequest } from '@/types'

const PERFIS: Perfil[] = ['ALUNO','RESPONSAVEL','SECRETARIA','COORDENACAO','DIRECAO','ADMIN']

export default function UsuariosPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [search, setSearch]       = useState('')
  const [perfilFilter, setPerfilFilter] = useState<Perfil | ''>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser,   setEditUser]   = useState<Usuario | null>(null)
  const [form, setForm] = useState<CreateUsuarioRequest>({ nome:'', email:'', senha:'', perfil:'ALUNO' })
  const [editForm, setEditForm] = useState<UpdateUsuarioRequest>({ nome:'', email:'' })

  const filtered = useMemo(() => {
    const list = data ?? []
    const q = search.toLowerCase()
    return list.filter(u => {
      const matchSearch = !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.matricula ?? '').toLowerCase().includes(q)
      const matchPerfil = !perfilFilter || u.perfil === perfilFilter
      return matchSearch && matchPerfil
    })
  }, [data, search, perfilFilter])

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Usuário criado!')
      refetch()
      setCreateOpen(false)
      setForm({ nome:'', email:'', senha:'', perfil:'ALUNO' })
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleUpdate() {
    if (!editUser) return
    try {
      await svc.update(editUser.id, editForm)
      toast.success('Usuário atualizado!')
      refetch()
      setEditUser(null)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`Remover ${u.nome}?`)) return
    try {
      await svc.delete(u.id)
      toast.success('Usuário removido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Usuario>[] = [
    { key:'id',       header:'ID',       render: u => <span className="text-gray-400">#{u.id}</span> },
    { key:'nome',     header:'Nome',     render: u => <span className="font-medium">{u.nome}</span> },
    { key:'email',    header:'E-mail',   render: u => u.email },
    { key:'perfil',   header:'Perfil',   render: u => <PerfilBadge perfil={u.perfil} /> },
    { key:'matricula',header:'Matrícula',render: u => u.matricula ?? '—' },
    { key:'acoes',    header:'Ações',    render: u => (
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-1" onClick={() => { setEditUser(u); setEditForm({ nome: u.nome, email: u.email }) }}>
          <Pencil size={15} />
        </button>
        <button className="btn-ghost p-1 text-red-500 hover:bg-red-50" onClick={() => handleDelete(u)}>
          <Trash2 size={15} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Usuários" subtitle="Gerencie os usuários do sistema."
        action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Novo Usuário</button>} />

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-8"
            placeholder="Buscar por nome, e-mail ou matrícula…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field w-auto"
          value={perfilFilter}
          onChange={e => setPerfilFilter(e.target.value as Perfil | '')}
        >
          <option value="">Todos os perfis</option>
          {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(search || perfilFilter) && (
          <span className="text-xs text-gray-400">{filtered.length} resultado(s)</span>
        )}
      </div>

      {isLoading ? <Loading /> : <DataTable columns={columns} data={filtered} keyField="id" />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Usuário">
        <div className="space-y-3">
          {(['nome','email','senha'] as const).map(field => (
            <div key={field}>
              <label className="label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="input-field" type={field === 'senha' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field] ?? ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="label">Perfil</label>
            <select className="select-field" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value as Perfil }))}>
              {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="label">Matrícula (opcional)</label>
            <input className="input-field" value={form.matricula ?? ''} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} /></div>
          <div><label className="label">CPF (opcional)</label>
            <input className="input-field" value={form.cpf ?? ''} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuário">
        <div className="space-y-3">
          <div><label className="label">Nome</label>
            <input className="input-field" value={editForm.nome ?? ''} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} /></div>
          <div><label className="label">E-mail</label>
            <input className="input-field" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setEditUser(null)}>Cancelar</button>
            <button className="btn-primary" onClick={handleUpdate}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
