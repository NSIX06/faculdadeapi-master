'use client'

import { X } from 'lucide-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { StatusAtestado, Perfil } from '@/types'

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const modalSizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full bg-white rounded-2xl shadow-xl animate-fade-in', modalSizes[size])}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

const statusStyles: Record<StatusAtestado, string> = {
  RECEBIDO:   'bg-blue-50 text-blue-700 ring-blue-600/20',
  EM_ANALISE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  APROVADO:   'bg-green-50 text-green-700 ring-green-600/20',
  RECUSADO:   'bg-red-50 text-red-700 ring-red-600/20',
}

const statusLabels: Record<StatusAtestado, string> = {
  RECEBIDO: 'Recebido', EM_ANALISE: 'Em Análise', APROVADO: 'Aprovado', RECUSADO: 'Recusado',
}

export function StatusBadge({ status }: { status: StatusAtestado }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset', statusStyles[status])}>
      {statusLabels[status]}
    </span>
  )
}

// ── PerfilBadge ───────────────────────────────────────────────────────────────

const perfilStyles: Record<Perfil, string> = {
  ADMIN: 'bg-gray-900 text-white', DIRECAO: 'bg-purple-100 text-purple-700',
  COORDENACAO: 'bg-brand-100 text-brand-700', SECRETARIA: 'bg-teal-100 text-teal-700',
  RESPONSAVEL: 'bg-orange-100 text-orange-700', ALUNO: 'bg-sky-100 text-sky-700',
}

export function PerfilBadge({ perfil }: { perfil: Perfil }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', perfilStyles[perfil])}>
      {perfil}
    </span>
  )
}

// ── DataTable ─────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
}

export function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  if (data.length === 0) return <EmptyState message="Nenhum registro encontrado." />
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(row => (
            <tr key={String(row[keyField])} className="bg-white hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700">{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Loading ───────────────────────────────────────────────────────────────────

export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  )
}
