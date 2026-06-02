'use client'

import { useState, useEffect } from 'react'
import { Save, User, Mail, Hash, Building2, Phone, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { usuarios as svc } from '@/services/api'
import { PerfilBadge, PageHeader } from '@/components/ui'

export default function PerfilPage() {
  const { user } = useAuth()
  const [nome, setNome]   = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setNome(user.nome)
      setEmail(user.email)
    }
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      await svc.update(user.id, { nome, email })
      toast.success('Perfil atualizado!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const fields = [
    { icon: Hash,      label: 'ID',          value: `#${user.id}`,             editable: false },
    { icon: ShieldCheck, label: 'Perfil',    value: user.perfil,               editable: false, badge: true },
    { icon: Hash,      label: 'Matrícula',   value: user.matricula ?? '—',     editable: false },
    { icon: Building2, label: 'Departamento', value: user.departamento ?? '—', editable: false },
    { icon: Phone,     label: 'Ramal',       value: user.ramal ?? '—',         editable: false },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Meu Perfil"
        subtitle="Visualize e edite suas informações pessoais."
      />

      {/* Avatar card */}
      <div className="card mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
          {user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-display">{user.nome}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <div className="mt-1"><PerfilBadge perfil={user.perfil} /></div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="card mb-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Informações Editáveis</h2>
        <div className="space-y-4">
          <div>
            <label className="label flex items-center gap-1.5">
              <User size={13} className="text-gray-400" /> Nome
            </label>
            <input
              className="input-field"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail size={13} className="text-gray-400" /> E-mail
            </label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Salvando…' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Read-only info */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Informações da Conta</h2>
        <div className="space-y-3">
          {fields.map(({ icon: Icon, label, value, badge }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={14} className="text-gray-400 dark:text-gray-500" />
                {label}
              </div>
              {badge
                ? <PerfilBadge perfil={value as import('@/types').Perfil} />
                : <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
              }
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Hash size={14} className="text-gray-400 dark:text-gray-500" /> Cadastro
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {new Date(user.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
