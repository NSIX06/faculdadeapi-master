'use client'

import { useState } from 'react'
import { Plus, BarChart2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { relatorios as svc, usuarios } from '@/services/api'
import { Modal, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { GenerateRelatorioRequest, TipoRelatorio } from '@/types'

export default function RelatoriosPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const { data: userList }           = useApi(() => usuarios.list())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<GenerateRelatorioRequest>({ tipo: 'atestados_por_periodo' })

  async function handleGenerate() {
    try {
      await svc.generate(form)
      toast.success('Relatório gerado!')
      refetch()
      setOpen(false)
      setForm({ tipo: 'atestados_por_periodo' })
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const TIPO_LABELS: Record<TipoRelatorio, string> = {
    atestados_por_periodo: 'Atestados por Período',
    faltas_por_aluno: 'Faltas por Aluno',
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Relatórios"
        subtitle="Gere e consulte relatórios acadêmicos."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Gerar Relatório
          </button>
        }
      />

      {isLoading ? <Loading /> : (
        (data ?? []).length === 0
          ? <EmptyState message="Nenhum relatório gerado ainda." />
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data ?? []).map(r => (
                <div key={r.id} className="card animate-fade-in flex flex-col gap-3">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    {r.tipoRelatorio === 'faltas_por_aluno'
                      ? <Users size={18} className="text-brand-600" />
                      : <BarChart2 size={18} className="text-brand-600" />}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {TIPO_LABELS[r.tipoRelatorio as TipoRelatorio] ?? r.tipoRelatorio}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.dataGeracao).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })}
                  </p>
                  {r.parametrosFiltro && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1 font-mono">{r.parametrosFiltro}</p>
                  )}
                  {r.resultado !== null && r.resultado !== undefined && (
                    <pre className="text-xs bg-gray-900 text-green-400 rounded-xl p-3 overflow-auto max-h-40 font-mono">
                      {JSON.stringify(r.resultado, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Gerar Relatório">
        <div className="space-y-3">
          <div>
            <label className="label">Tipo</label>
            <select className="select-field" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoRelatorio }))}>
              <option value="atestados_por_periodo">Atestados por Período</option>
              <option value="faltas_por_aluno">Faltas por Aluno</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data Início</label>
              <input className="input-field" type="date" value={form.dataInicio ?? ''} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input className="input-field" type="date" value={form.dataFim ?? ''} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          {form.tipo === 'faltas_por_aluno' && (
            <div>
              <label className="label">Aluno</label>
              <select className="select-field" value={form.usuarioId ?? ''} onChange={e => setForm(f => ({ ...f, usuarioId: Number(e.target.value) }))}>
                <option value="">Selecione...</option>
                {(userList ?? []).filter(u => u.perfil === 'ALUNO').map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleGenerate}>Gerar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
