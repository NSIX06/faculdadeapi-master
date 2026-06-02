'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { cronograma as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Cronograma, CreateCronogramaRequest } from '@/types'

export default function CronogramaPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateCronogramaRequest>({
    anoLetivo: new Date().getFullYear(),
    dataInicioSemestre: '',
    dataFimSemestre: '',
    periodosAvaliacao: '',
  })

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Cronograma criado!')
      refetch()
      setOpen(false)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const columns: Column<Cronograma>[] = [
    { key:'ano',    header:'Ano Letivo',  render: c => <span className="font-semibold">{c.anoLetivo}</span> },
    { key:'inicio', header:'Início',      render: c => fmt(c.dataInicioSemestre) },
    { key:'fim',    header:'Término',     render: c => fmt(c.dataFimSemestre) },
    { key:'periodos',header:'Períodos de Avaliação', render: c => <span className="text-xs">{c.periodosAvaliacao}</span> },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Cronograma"
        subtitle="Calendário acadêmico semestral."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo Cronograma
          </button>
        }
      />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Cronograma">
        <div className="space-y-3">
          <div>
            <label className="label">Ano Letivo</label>
            <input className="input-field" type="number" value={form.anoLetivo} onChange={e => setForm(f => ({ ...f, anoLetivo: Number(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data de Início</label>
              <input className="input-field" type="date" value={form.dataInicioSemestre} onChange={e => setForm(f => ({ ...f, dataInicioSemestre: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data de Término</label>
              <input className="input-field" type="date" value={form.dataFimSemestre} onChange={e => setForm(f => ({ ...f, dataFimSemestre: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Períodos de Avaliação</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.periodosAvaliacao} onChange={e => setForm(f => ({ ...f, periodosAvaliacao: e.target.value }))} />
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
