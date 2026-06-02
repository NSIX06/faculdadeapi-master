'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { auth } from '@/services/api'
import type { LoginRequest, Usuario } from '@/types'

interface AuthContextValue {
  user: Usuario | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<Usuario | null>(null)
  const [token, setToken]       = useState<string | null>(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token')
    const storedUser  = localStorage.getItem('auth_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser) as Usuario)
    }
    setLoading(false)
  }, [])

  async function login(data: LoginRequest) {
    const res = await auth.login(data)
    localStorage.setItem('jwt_token', res.token)
    localStorage.setItem('auth_user', JSON.stringify(res.usuario))
    setToken(res.token)
    setUser(res.usuario)
  }

  function logout() {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
