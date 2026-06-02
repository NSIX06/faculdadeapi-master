'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, BookOpen, Bell,
  Calendar, BarChart2, GraduationCap, BookMarked,
  HelpCircle, LogOut, UserCircle, Sun, Moon,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useApi } from '@/hooks/useApi'
import { notificacoes } from '@/services/api'
import { HelpModal } from '@/components/HelpModal'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Painel' },
  { href: '/atestados',    icon: FileText,         label: 'Atestados' },
  { href: '/usuarios',     icon: Users,            label: 'Usuários' },
  { href: '/turmas',       icon: BookMarked,       label: 'Turmas' },
  { href: '/notificacoes', icon: Bell,             label: 'Notificações', badge: true },
  { href: '/cronograma',   icon: Calendar,         label: 'Cronograma' },
  { href: '/relatorios',   icon: BarChart2,        label: 'Relatórios' },
  { href: '/cursos',       icon: GraduationCap,    label: 'Cursos' },
  { href: '/disciplinas',  icon: BookOpen,         label: 'Disciplinas' },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: notifData } = useApi(() => notificacoes.list({ naoLidas: true }))
  const unreadCount = notifData?.length ?? 0
  const [helpOpen, setHelpOpen] = useState(false)

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AE'

  return (
    <>
      <aside className="flex flex-col w-[272px] h-full bg-brand-950 text-brand-300">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-brand-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-display leading-none">Atestado</p>
                <p className="text-xs text-brand-400 mt-0.5">Gestão Escolar</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-500/20 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-brand-500/20 text-white'
                  : 'text-brand-300 hover:bg-brand-500/10 hover:text-white',
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-brand-900 space-y-0.5">
          <Link
            href="/perfil"
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all',
              pathname === '/perfil'
                ? 'bg-brand-500/20 text-white'
                : 'text-brand-300 hover:bg-brand-500/10 hover:text-white',
            )}
          >
            <UserCircle size={18} /> Meu Perfil
          </Link>
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-500/10 hover:text-white transition-all"
          >
            <HelpCircle size={18} /> Ajuda
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} /> Sair
          </button>
          <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-brand-900">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.nome}</p>
              <p className="text-xs text-brand-400 truncate">{user?.perfil}</p>
            </div>
          </div>
        </div>
      </aside>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
