'use client'

import { useState, useRef } from 'react'
import { Plus, Eye, Trash2, Filter, User, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { atestados as svc, usuarios } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { Modal, StatusBadge, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { Atestado, StatusAtestado, CreateAtestadoRequest, UpdateStatusRequest } from '@/types'
import { can } from '@/lib/permissions'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'RECEBIDO',   label: 'Recebido' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'APROVADO',   label: 'Aprovado' },
  { value: 'RECUSADO',   label: 'Recusado' },
]

const STATUS_LABELS: Record<string, string> = {
  RECEBIDO:   'Recebido',
  EM_ANALISE: 'Em Análise',
  APROVADO:   'Aprovado',
  RECUSADO:   'Recusado',
}

const MAX_SIZE_MB = 2

function isDataUrl(s?: string) {
  return !!s && s.startsWith('data:')
}

function isImage(s: string) {
  return s.startsWith('data:image/')
}

function FilePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (base64: string, name: string) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const sizeMB = file.size / 1024 / 1024
    if (sizeMB > MAX_SIZE_MB) {
      toast.error(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => { onChange(reader.result as string, file.name) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (value) return null

  return (
    <div
      className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      <Paperclip size={20} className="mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Clique para selecionar um arquivo</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, JPG ou PNG — máx. {MAX_SIZE_MB}MB</p>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
    </div>
  )
}

function FilePreview({ value, name, onClear }: { value: string; name: string; onClear: () => void }) {
  const isPdf = value.startsWith('data:application/pdf')
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {isPdf ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800">
          <FileText size={18} className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{name}</span>
          <a href={value} target="_blank" rel="noreferrer" className="text-xs text-brand-600 dark:text-brand-400 underline flex-shrink-0">Abrir</a>
          <button onClick={onClear} className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={name} className="w-full max-h-40 object-contain bg-gray-50 dark:bg-gray-800" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a href={value} target="_blank" rel="noreferrer" className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-lg font-medium">Ver</a>
            <button onClick={onClear} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Remover</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <ImageIcon size={13} className="text-brand-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function AnexoViewer({ url }: { url: string }) {
  const isPdf  = url.startsWith('data:application/pdf') || url.endsWith('.pdf')
  const isImg  = isImage(url) || /\.(jpe?g|png|gif|webp)$/i.test(url)
  const isData = isDataUrl(url)

  if (isPdf) {
    return (
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Anexo</p>
        {isData ? (
          <iframe src={url} className="w-full h-64 rounded-xl border border-gray-100 dark:border-gray-700" />
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 text-sm underline">Abrir PDF</a>
        )}
      </div>
    )
  }

  if (isImg) {
    return (
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Anexo</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Atestado" className="max-h-48 rounded-xl border border-gray-100 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800 w-full" />
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 dark:text-brand-400 underline mt-1 block">Abrir em nova aba</a>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Anexo</p>
      <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 dark:text-brand-400 text-sm underline">Ver documento</a>
    </div>
  )
}

export default function AtestadosPage() {
  const { user } = useAuth()
  const perfil = user?.perfil
  const canViewAll     = can(perfil, 'atestados.viewAll')
  const canDelete      = can(perfil, 'atestados.delete')
  const canUpdateStatus = can(perfil, 'atestados.updateStatus')

  const [statusFilter, setStatusFilter] = useState('')
  const [alunoFilter,  setAlunoFilter]  = useState(0)
  const { data, isLoading, refetch } = useApi(
    () => svc.list({
      ...(statusFilter ? { status: statusFilter as StatusAtestado } : {}),
      // If user can't view all, force-filter by their own ID
      usuarioId: canViewAll ? (alunoFilter || undefined) : (user?.id ?? 0),
    }),
  )
  const { data: userList } = useApi(() => canViewAll ? usuarios.list() : Promise.resolve([]))
  const alunos = (userList ?? []).filter(u => u.perfil === 'ALUNO')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Atestado | null>(null)
  const [form, setForm]             = useState<CreateAtestadoRequest>({ usuarioId: 0, periodo: '', motivo: '' })
  const [fileName, setFileName]     = useState('')
  const [statusForm, setStatusForm] = useState<UpdateStatusRequest>({ status: 'RECEBIDO' })

  function applyFilters() { setTimeout(refetch, 0) }

  function resetCreate() {
    setForm({ usuarioId: 0, periodo: '', motivo: '' })
    setFileName('')
    setCreateOpen(false)
  }

  async function handleCreate() {
    try {
      const payload = canViewAll ? form : { ...form, usuarioId: user?.id ?? 0 }
      await svc.create(payload)
      toast.success('Atestado enviado!')
      refetch()
      resetCreate()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleUpdateStatus() {
    if (!detailItem) return
    try {
      await svc.updateStatus(detailItem.id, statusForm)
      toast.success('Status atualizado!')
      refetch()
      setDetailItem(null)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleDelete(a: Atestado) {
    try {
      await svc.delete(a.id)
      toast.success('Atestado removido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  function alunoNome(usuarioId: number) {
    return userList?.find(u => u.id === usuarioId)?.nome ?? `Aluno #${usuarioId}`
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Atestados"
        subtitle="Gerencie os atestados acadêmicos."
        action={
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Novo Atestado
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter size={15} className="text-gray-400 flex-shrink-0" />
        <select
          className="select-field w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); applyFilters() }}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {canViewAll && (
          <select
            className="select-field w-auto"
            value={alunoFilter || ''}
            onChange={e => { setAlunoFilter(Number(e.target.value)); applyFilters() }}
          >
            <option value="">Todos os alunos</option>
            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        )}
        {(statusFilter || alunoFilter) && (
          <button
            className="btn-ghost text-xs px-2 py-1 text-gray-500"
            onClick={() => { setStatusFilter(''); setAlunoFilter(0); applyFilters() }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {isLoading ? <Loading /> : (
        (data ?? []).length === 0
          ? <EmptyState message="Nenhum atestado encontrado." />
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data ?? []).map(a => (
                <div key={a.id} className="card animate-fade-in flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-gray-400 dark:text-gray-500">#{a.id}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{a.motivo}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.periodo}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <User size={12} className="text-gray-400 dark:text-gray-500" />
                    <span>{a.usuario?.nome ?? alunoNome(a.usuarioId)}</span>
                  </div>
                  {a.arquivoAnexo && (
                    <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400">
                      <Paperclip size={12} />
                      <span>Anexo incluído</span>
                    </div>
                  )}
                  {a.justificativaRecusa && (
                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                      {a.justificativaRecusa}
                    </p>
                  )}
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button className="btn-ghost text-xs px-2 py-1" onClick={() => { setDetailItem(a); setStatusForm({ status: a.status }) }}>
                      <Eye size={14} /> Detalhes
                    </button>
                    {canDelete && (
                      <button className="btn-ghost text-xs px-2 py-1 text-red-500 dark:text-red-400" onClick={() => handleDelete(a)}>
                        <Trash2 size={14} /> Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={resetCreate} title="Novo Atestado">
        <div className="space-y-4">
          {canViewAll ? (
            <div>
              <label className="label">Aluno</label>
              <select className="select-field" value={form.usuarioId || ''} onChange={e => setForm(f => ({ ...f, usuarioId: Number(e.target.value) }))}>
                <option value="">Selecione...</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
          ) : (
            <input type="hidden" value={user?.id ?? 0} />
          )}
          <div>
            <label className="label">Período</label>
            <input className="input-field" placeholder="dd/mm/aaaa a dd/mm/aaaa" value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} />
          </div>
          <div>
            <label className="label">Motivo</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Paperclip size={13} className="text-gray-400" /> Arquivo do Atestado
            </label>
            {form.arquivoAnexo ? (
              <FilePreview
                value={form.arquivoAnexo}
                name={fileName}
                onClear={() => { setForm(f => ({ ...f, arquivoAnexo: undefined })); setFileName('') }}
              />
            ) : (
              <FilePicker
                value={form.arquivoAnexo ?? ''}
                onChange={(base64, name) => { setForm(f => ({ ...f, arquivoAnexo: base64 })); setFileName(name) }}
                onClear={() => { setForm(f => ({ ...f, arquivoAnexo: undefined })); setFileName('') }}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn-secondary" onClick={resetCreate}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Enviar Atestado</button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Detalhes do Atestado" size="lg">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Aluno</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{detailItem.usuario?.nome ?? alunoNome(detailItem.usuarioId)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
                <StatusBadge status={detailItem.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Motivo</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{detailItem.motivo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Período</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{detailItem.periodo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Emissão</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(detailItem.dataEmissao).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {detailItem.arquivoAnexo && <AnexoViewer url={detailItem.arquivoAnexo} />}

            {detailItem.justificativaRecusa && (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3">
                <p className="text-xs text-red-500 font-medium mb-0.5">Justificativa de Recusa</p>
                <p className="text-sm text-red-700 dark:text-red-300">{detailItem.justificativaRecusa}</p>
              </div>
            )}

            {canUpdateStatus ? (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Atualizar Status</p>
                <div className="space-y-3">
                  <select
                    className="select-field"
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value as StatusAtestado }))}
                  >
                    {(['RECEBIDO','EM_ANALISE','APROVADO','RECUSADO'] as StatusAtestado[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  {statusForm.status === 'RECUSADO' && (
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      placeholder="Justificativa para recusa..."
                      value={statusForm.justificativaRecusa ?? ''}
                      onChange={e => setStatusForm(f => ({ ...f, justificativaRecusa: e.target.value }))}
                    />
                  )}
                  <div className="flex justify-end gap-2">
                    <button className="btn-secondary" onClick={() => setDetailItem(null)}>Fechar</button>
                    <button className="btn-primary" onClick={handleUpdateStatus}>Salvar Status</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                <button className="btn-secondary" onClick={() => setDetailItem(null)}>Fechar</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
