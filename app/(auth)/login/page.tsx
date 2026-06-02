'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, senha })
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left decorative half */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-950 p-12"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, #157a52 0%, #052e16 70%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <span className="text-white font-bold font-display text-lg">Atestado Escolar</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white font-display leading-tight mb-4">
            Gestão de<br />Atestados<br />Acadêmicos
          </h1>
          <p className="text-brand-300 text-sm leading-relaxed max-w-xs">
            Envie, acompanhe e valide atestados médicos e acadêmicos de forma simples e segura.
          </p>
        </div>
        <p className="text-brand-500 text-xs">© 2024 Atestado Escolar</p>
      </div>

      {/* Right form half */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-display">Bem-vindo de volta</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entre com suas credenciais para continuar.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input-field" placeholder="seu@email.edu.br"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="senha">Senha</label>
              <div className="relative">
                <input id="senha" type={showPwd ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Credenciais de teste:</p>
            <p>admin@escola.edu.br</p>
            <p>Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
