'use client'

import Link from 'next/link'
import { Users, FileText, BookMarked, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { atestados, usuarios, turmas, notificacoes } from '@/services/api'
import { StatusBadge, Loading } from '@/components/ui'
import type { StatusAtestado } from '@/types'

const STATUS_LIST: StatusAtestado[] = ['RECEBIDO', 'EM_ANALISE', 'APROVADO', 'RECUSADO']
const STATUS_LABELS: Record<StatusAtestado, string> = {
  RECEBIDO: 'Recebido', EM_ANALISE: 'Em Análise', APROVADO: 'Aprovado', RECUSADO: 'Recusado',
}
const STATUS_COLORS: Record<StatusAtestado, string> = {
  RECEBIDO: 'bg-blue-500', EM_ANALISE: 'bg-amber-500', APROVADO: 'bg-brand-500', RECUSADO: 'bg-red-500',
}

function greeting(nome: string) {
  const h = new Date().getHours()
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return `${part}, ${nome.split(' ')[0]}!`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: atestadosList, isLoading: loadingA } = useApi(() => atestados.list())
  const { data: usuariosList }  = useApi(() => usuarios.list())
  const { data: turmasList }    = useApi(() => turmas.list())
  const { data: notifList }     = useApi(() => notificacoes.list())

  const total    = atestadosList?.length ?? 0
  const naoLidas = notifList?.filter(n => !n.lida).length ?? 0
  const recentes = [...(atestadosList ?? [])].sort((a, b) =>
    new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
  ).slice(0, 5)

  const stats = [
    { label: 'Atestados',    value: total,                     icon: FileText,   href: '/atestados',    color: 'text-blue-500',   bg: 'bg-blue-50' },
    { label: 'Usuários',     value: usuariosList?.length ?? 0, icon: Users,      href: '/usuarios',     color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Turmas',       value: turmasList?.length ?? 0,   icon: BookMarked, href: '/turmas',       color: 'text-brand-500',  bg: 'bg-brand-50' },
    { label: 'Notificações', value: naoLidas,                  icon: Bell,       href: '/notificacoes', color: 'text-amber-500',  bg: 'bg-amber-50' },
  ]

  if (loadingA) return <Loading />

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          {user ? greeting(user.nome) : 'Bem-vindo!'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Confira o status das suas solicitações acadêmicas hoje.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, href, color, bg }, i) => (
          <Link key={label} href={href} className={`card hover:shadow-md transition-shadow animate-fade-in-delay-${i + 1}`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-display">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Atestados Recentes</h2>
          {recentes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atestado encontrado.</p>
          ) : (
            <div className="space-y-3">
              {recentes.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.motivo}</p>
                    <p className="text-xs text-gray-400">{a.periodo}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Por Status</h2>
          <div className="space-y-3">
            {STATUS_LIST.map(s => {
              const count = atestadosList?.filter(a => a.status === s).length ?? 0
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{STATUS_LABELS[s]}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[s]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
