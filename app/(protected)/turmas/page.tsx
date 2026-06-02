'use client'

import { useState } from 'react'
import { Plus, Settings, Trash2, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { turmas as svc, cursos, disciplinas, usuarios } from '@/services/api'
import { Modal, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { Turma, CreateTurmaRequest } from '@/types'

export default function TurmasPage() {
  const { data, isLoading, refetch }  = useApi(() => svc.list())
  const { data: cursoList }           = useApi(() => cursos.list())
  const { data: discList }            = useApi(() => disciplinas.list())
  const { data: userList }            = useApi(() => usuarios.list())
  const alunos = (userList ?? []).filter(u => u.perfil === 'ALUNO')

  const [createOpen, setCreateOpen]   = useState(false)
  const [manageTurma, setManageTurma] = useState<Turma | null>(null)
  const [form, setForm]               = useState<CreateTurmaRequest>({ codigoTurma:'', cursoId:0, disciplinaId:0 })
  const [addAlunoId, setAddAlunoId]   = useState(0)

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Turma criada!')
      refetch()
      setCreateOpen(false)
      setForm({ codigoTurma:'', cursoId:0, disciplinaId:0 })
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleDelete(t: Turma) {
    if (!confirm(`Remover turma ${t.codigoTurma}?`)) return
    try {
      await svc.delete(t.id)
      toast.success('Turma removida.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleConnect() {
    if (!manageTurma || !addAlunoId) return
    try {
      await svc.update(manageTurma.id, { conectar: [addAlunoId] })
      toast.success('Aluno vinculado!')
      refetch()
      const updated = await svc.get(manageTurma.id)
      setManageTurma(updated)
      setAddAlunoId(0)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleDisconnect(turmaId: number, alunoId: number) {
    try {
      await svc.update(turmaId, { desconectar: [alunoId] })
      toast.success('Aluno desvinculado.')
      refetch()
      const updated = await svc.get(turmaId)
      setManageTurma(updated)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const available = manageTurma
    ? alunos.filter(a => !manageTurma.alunos.some(ma => ma.id === a.id))
    : alunos

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Turmas"
        subtitle="Gerencie turmas e vínculos de alunos."
        action={
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Nova Turma
          </button>
        }
      />

      {isLoading ? <Loading /> : (
        (data ?? []).length === 0
          ? <EmptyState message="Nenhuma turma cadastrada." />
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data ?? []).map(t => (
                <div key={t.id} className="card animate-fade-in flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-bold rounded-lg">
                      {t.codigoTurma}
                    </span>
                    <span className="text-xs text-gray-400">{t.alunos.length} alunos</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{t.curso.nome}</p>
                  <p className="text-xs text-gray-500">{t.disciplina.nome}</p>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                    <button className="btn-ghost text-xs px-2 py-1" onClick={() => setManageTurma(t)}>
                      <Settings size={14} /> Gerenciar
                    </button>
                    <button className="btn-ghost text-xs px-2 py-1 text-red-500" onClick={() => handleDelete(t)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Turma">
        <div className="space-y-3">
          <div>
            <label className="label">Código da Turma</label>
            <input className="input-field" value={form.codigoTurma} onChange={e => setForm(f => ({ ...f, codigoTurma: e.target.value }))} />
          </div>
          <div>
            <label className="label">Curso</label>
            <select className="select-field" value={form.cursoId || ''} onChange={e => setForm(f => ({ ...f, cursoId: Number(e.target.value) }))}>
              <option value="">Selecione...</option>
              {(cursoList ?? []).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Disciplina</label>
            <select className="select-field" value={form.disciplinaId || ''} onChange={e => setForm(f => ({ ...f, disciplinaId: Number(e.target.value) }))}>
              <option value="">Selecione...</option>
              {(discList ?? []).map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>

      {/* Manage modal */}
      <Modal open={!!manageTurma} onClose={() => setManageTurma(null)} title={`Turma ${manageTurma?.codigoTurma ?? ''}`} size="lg">
        {manageTurma && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Curso</p><p className="font-medium">{manageTurma.curso.nome}</p></div>
              <div><p className="text-xs text-gray-400">Disciplina</p><p className="font-medium">{manageTurma.disciplina.nome}</p></div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Vincular aluno</p>
              <div className="flex gap-2">
                <select className="select-field flex-1" value={addAlunoId || ''} onChange={e => setAddAlunoId(Number(e.target.value))}>
                  <option value="">Selecione aluno...</option>
                  {available.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                <button className="btn-primary flex-shrink-0" onClick={handleConnect}>
                  <UserPlus size={15} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Alunos vinculados ({manageTurma.alunos.length})</p>
              {manageTurma.alunos.length === 0
                ? <p className="text-sm text-gray-400">Nenhum aluno vinculado.</p>
                : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {manageTurma.alunos.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                        <span className="text-sm">{a.nome}</span>
                        <button className="btn-ghost p-1 text-red-500" onClick={() => handleDisconnect(manageTurma.id, a.id)}>
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
