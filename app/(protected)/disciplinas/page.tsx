'use client'

import { useState, useMemo } from 'react'
import { Plus, BookOpen, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { disciplinas as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Disciplina } from '@/types'

export default function DisciplinasPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [search, setSearch]  = useState('')
  const [open, setOpen]      = useState(false)
  const [nome, setNome]      = useState('')
  const [cargaHoraria, setCarga] = useState(0)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (data ?? []).filter(d => !q || d.nome.toLowerCase().includes(q))
  }, [data, search])

  async function handleCreate() {
    try {
      await svc.create({ nome, cargaHoraria })
      toast.success('Disciplina criada!')
      refetch()
      setOpen(false)
      setNome('')
      setCarga(0)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Disciplina>[] = [
    { key:'id',    header:'ID',    render: d => <span className="text-gray-400">#{d.id}</span> },
    { key:'nome',  header:'Nome',  render: d => (
      <div className="flex items-center gap-2">
        <BookOpen size={15} className="text-brand-500" />
        <span className="font-medium">{d.nome}</span>
      </div>
    )},
    { key:'carga', header:'Carga Horária', render: d => (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
        {d.cargaHoraria}h
      </span>
    )},
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Disciplinas"
        subtitle="Gerencie as disciplinas da instituição."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nova Disciplina
          </button>
        }
      />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input-field pl-8"
          placeholder="Buscar disciplina…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? <Loading /> : <DataTable columns={columns} data={filtered} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Disciplina" size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Estrutura de Dados" />
          </div>
          <div>
            <label className="label">Carga Horária (horas)</label>
            <input className="input-field" type="number" min={1} value={cargaHoraria || ''} onChange={e => setCarga(Number(e.target.value))} placeholder="Ex: 60" />
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
