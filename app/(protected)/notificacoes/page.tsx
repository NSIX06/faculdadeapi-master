'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useApi } from '@/hooks/useApi'
import { notificacoes as svc } from '@/services/api'
import { PageHeader, Loading, EmptyState } from '@/components/ui'

export default function NotificacoesPage() {
  const [naoLidas, setNaoLidas] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const { data, isLoading, refetch } = useApi(() => svc.list(naoLidas ? { naoLidas: true } : undefined))

  async function handleRead(id: number) {
    try {
      await svc.markAsRead(id)
      toast.success('Marcado como lido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleMarkAll() {
    const unread = (data ?? []).filter(n => !n.lida)
    if (unread.length === 0) return
    setMarkingAll(true)
    try {
      await Promise.all(unread.map(n => svc.markAsRead(n.id)))
      toast.success(`${unread.length} notificação(ões) marcada(s) como lida(s).`)
      refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = (data ?? []).filter(n => !n.lida).length

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Notificações"
        subtitle="Acompanhe seus avisos e atualizações."
        action={
          unreadCount > 0 ? (
            <button
              className="btn-secondary text-sm"
              onClick={handleMarkAll}
              disabled={markingAll}
            >
              <CheckCheck size={15} />
              {markingAll ? 'Marcando…' : `Marcar todas (${unreadCount})`}
            </button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-2 mb-5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-gray-400">
          <div
            onClick={() => { setNaoLidas(v => !v); setTimeout(refetch, 0) }}
            className={clsx(
              'w-10 h-5 rounded-full transition-colors cursor-pointer relative',
              naoLidas ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700',
            )}
          >
            <span className={clsx(
              'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
              naoLidas ? 'translate-x-5' : 'translate-x-0.5',
            )} />
          </div>
          Somente não lidas
        </label>
      </div>

      {isLoading ? <Loading /> : (
        (data ?? []).length === 0
          ? <EmptyState message="Nenhuma notificação encontrada." />
          : (
            <div className="space-y-2">
              {(data ?? []).map(n => (
                <div
                  key={n.id}
                  className={clsx(
                    'flex items-start gap-3 p-4 rounded-2xl border transition-all',
                    !n.lida
                      ? 'border-brand-200 bg-brand-50 border-l-4 border-l-brand-500 dark:bg-brand-950/30 dark:border-brand-800 dark:border-l-brand-500'
                      : 'border-gray-100 bg-white opacity-70 dark:border-gray-800 dark:bg-gray-900',
                  )}
                >
                  <Bell size={16} className={n.lida ? 'text-gray-400 dark:text-gray-600 mt-0.5' : 'text-brand-500 mt-0.5'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{n.mensagem}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(n.dataEnvio).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">{n.tipoStatus}</span>
                    </div>
                  </div>
                  {!n.lida && (
                    <button className="btn-ghost p-1 text-brand-600 dark:text-brand-400 flex-shrink-0" onClick={() => handleRead(n.id)}>
                      <Check size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
      )}
    </div>
  )
}
