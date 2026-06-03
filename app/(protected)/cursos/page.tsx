'use client'

import { useState, useMemo } from 'react'
import { Plus, GraduationCap, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/contexts/AuthContext'
import { cursos as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Curso } from '@/types'
import { can } from '@/lib/permissions'

export default function CursosPage() {
  const { user } = useAuth()
  const canCreate = can(user?.perfil, 'cursos.create')

  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(false)
  const [nome, setNome]     = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (data ?? []).filter(c => !q || c.nome.toLowerCase().includes(q))
  }, [data, search])

  async function handleCreate() {
    try {
      await svc.create({ nome })
      toast.success('Curso criado!')
      refetch()
      setOpen(false)
      setNome('')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Curso>[] = [
    { key:'id',   header:'ID',   render: c => <span className="text-gray-400">#{c.id}</span> },
    { key:'nome', header:'Nome', render: c => (
      <div className="flex items-center gap-2">
        <GraduationCap size={15} className="text-brand-500" />
        <span className="font-medium">{c.nome}</span>
      </div>
    )},
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Cursos"
        subtitle="Gerencie os cursos da instituição."
        action={canCreate ? (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo Curso
          </button>
        ) : undefined}
      />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-8"
          placeholder="Buscar curso…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? <Loading /> : <DataTable columns={columns} data={filtered} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Curso" size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Nome do Curso</label>
            <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Engenharia de Software" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
