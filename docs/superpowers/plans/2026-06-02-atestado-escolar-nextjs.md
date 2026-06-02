# Atestado Escolar — Next.js Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Next.js 15 App Router SPA at `C:\Users\felip\Downloads\atestado-escolar-nextjs` consuming the Atestado Escolar REST API (`https://faculdadeapi.vercel.app/api`) with 10 pages.

**Architecture:** Next.js App Router with two route groups — `(auth)` for the login page and `(protected)` for the 9 authenticated pages behind a sidebar layout. All pages and components are Client Components (`'use client'`) since they consume a JWT-authenticated REST API with no SSR data needs. Types, API client, auth context, and UI components are identical to the Vite design, adapted for Next.js conventions.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5+, TailwindCSS 3, lucide-react, react-hot-toast, clsx, date-fns

---

## File Map

| File | Responsibility |
|---|---|
| `next.config.ts` | Next.js config |
| `tailwind.config.js` | Brand colors + font families |
| `tsconfig.json` | TS strict config + `@/*` alias |
| `.env.local` / `.env.example` | API base URL + API key |
| `app/globals.css` | Tailwind directives + utility classes |
| `app/layout.tsx` | Root layout — AuthProvider + Toaster |
| `app/page.tsx` | Root redirect to /dashboard |
| `app/(auth)/login/page.tsx` | Login page (client component) |
| `app/(protected)/layout.tsx` | Sidebar + header shell (ProtectedLayout) |
| `app/(protected)/dashboard/page.tsx` | Stats + recent atestados |
| `app/(protected)/usuarios/page.tsx` | User CRUD |
| `app/(protected)/atestados/page.tsx` | Atestado grid + modals |
| `app/(protected)/turmas/page.tsx` | Turma cards + aluno connect/disconnect |
| `app/(protected)/notificacoes/page.tsx` | Notification list |
| `app/(protected)/cronograma/page.tsx` | Schedule table |
| `app/(protected)/relatorios/page.tsx` | Report cards |
| `app/(protected)/cursos/page.tsx` | Course table |
| `app/(protected)/disciplinas/page.tsx` | Subject table |
| `src/types/index.ts` | All TS interfaces + enums + DTOs |
| `src/services/api.ts` | HTTP client + all endpoint namespaces |
| `src/contexts/AuthContext.tsx` | Auth state + login/logout + useAuth hook |
| `src/hooks/useApi.ts` | Generic async data fetching with refetch |
| `src/components/ui.tsx` | Modal, StatusBadge, PerfilBadge, DataTable, PageHeader, EmptyState, Loading |
| `src/components/Sidebar.tsx` | Sidebar nav (client component) |

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `C:\Users\felip\Downloads\atestado-escolar-nextjs\`

- [ ] **Step 1: Scaffold Next.js project**

Run in `C:\Users\felip\Downloads\`:
```powershell
npx create-next-app@latest atestado-escolar-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

When prompted interactively, use these answers (or pass flags to avoid prompts):
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Turbopack: No
- Import alias: `@/*`

- [ ] **Step 2: Install additional dependencies**

```powershell
cd atestado-escolar-nextjs
npm install lucide-react react-hot-toast date-fns clsx
```

- [ ] **Step 3: Create folder structure**

```powershell
mkdir src\types, src\services, src\contexts, src\hooks, src\components
mkdir app\(auth)\login
mkdir app\(protected)\dashboard
mkdir app\(protected)\usuarios
mkdir app\(protected)\atestados
mkdir app\(protected)\turmas
mkdir app\(protected)\notificacoes
mkdir app\(protected)\cronograma
mkdir app\(protected)\relatorios
mkdir app\(protected)\cursos
mkdir app\(protected)\disciplinas
```

- [ ] **Step 4: Git init and commit**

```powershell
git init
git add .
git commit -m "chore: scaffold next.js project with app router"
```

---

## Task 2: Configure Tailwind, fonts, env

**Files:**
- Modify: `tailwind.config.js` (or `tailwind.config.ts`)
- Modify: `app/globals.css`
- Modify: `next.config.ts`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Write `tailwind.config.js`** (replace entire file)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf7',
          100: '#dcfcee',
          200: '#bbf7dc',
          300: '#86efbf',
          400: '#4ade9d',
          500: '#24a872',
          600: '#1a9463',
          700: '#157a52',
          800: '#116142',
          900: '#0e4f36',
          950: '#052e16',
        },
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Update `app/globals.css`** (replace entire file)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  body { @apply font-sans text-gray-900 bg-gray-50 antialiased; }
  h1, h2, h3, h4, h5, h6 { @apply font-display; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-gray-400; }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium
           rounded-xl shadow-sm hover:bg-brand-600 active:scale-[0.98] transition-all duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium
           rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-[0.98]
           transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-danger {
    @apply inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium
           rounded-xl shadow-sm hover:bg-red-600 active:scale-[0.98] transition-all duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-ghost {
    @apply inline-flex items-center gap-2 px-3 py-2 text-gray-600 text-sm font-medium
           rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .input-field {
    @apply w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
           placeholder:text-gray-400 transition-all;
  }
  .select-field {
    @apply w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
           transition-all appearance-none cursor-pointer;
  }
  .card {
    @apply bg-white rounded-2xl border border-gray-100 shadow-sm p-6;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}

@layer utilities {
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
  .animate-fade-in-delay-1 { animation: fadeIn 0.3s ease-out 0.05s both; }
  .animate-fade-in-delay-2 { animation: fadeIn 0.3s ease-out 0.10s both; }
  .animate-fade-in-delay-3 { animation: fadeIn 0.3s ease-out 0.15s both; }
  .animate-fade-in-delay-4 { animation: fadeIn 0.3s ease-out 0.20s both; }
}
```

- [ ] **Step 3: Create `.env.local`**

```
NEXT_PUBLIC_API_BASE_URL=https://faculdadeapi.vercel.app/api
NEXT_PUBLIC_API_KEY=
```

- [ ] **Step 4: Create `.env.example`**

```
NEXT_PUBLIC_API_BASE_URL=https://faculdadeapi.vercel.app/api
NEXT_PUBLIC_API_KEY=your_api_key_here
```

- [ ] **Step 5: Ensure `.env.local` is gitignored** — Next.js scaffold gitignores `.env*.local` by default. Verify.

- [ ] **Step 6: Commit**

```powershell
git add .
git commit -m "chore: configure tailwind brand colors, fonts, env"
```

---

## Task 3: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
// ── Enums ─────────────────────────────────────────────────────────────────────

export type Perfil =
  | 'ALUNO'
  | 'RESPONSAVEL'
  | 'SECRETARIA'
  | 'COORDENACAO'
  | 'DIRECAO'
  | 'ADMIN'

export type StatusAtestado =
  | 'RECEBIDO'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'RECUSADO'

export type TipoRelatorio = 'atestados_por_periodo' | 'faltas_por_aluno'

// ── Entities ──────────────────────────────────────────────────────────────────

export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: Perfil
  matricula?: string
  cpf?: string
  ramal?: string
  departamento?: string
  codigoDiretoria?: string
  createdAt: string
}

export interface Curso {
  id: number
  nome: string
}

export interface Disciplina {
  id: number
  nome: string
  cargaHoraria: number
}

export interface Turma {
  id: number
  codigoTurma: string
  curso: Curso
  disciplina: Disciplina
  alunos: Usuario[]
  createdAt: string
}

export interface Atestado {
  id: number
  dataEmissao: string
  periodo: string
  motivo: string
  arquivoAnexo?: string
  status: StatusAtestado
  justificativaRecusa?: string
  usuarioId: number
  usuario?: Usuario
  cronogramaId?: number
  createdAt: string
}

export interface Notificacao {
  id: number
  mensagem: string
  dataEnvio: string
  /** Free-form status string set by the backend */
  tipoStatus: string
  lida: boolean
  usuarioId: number
}

export interface Cronograma {
  id: number
  anoLetivo: number
  dataInicioSemestre: string
  dataFimSemestre: string
  periodosAvaliacao: string
}

export interface Relatorio {
  id: number
  tipoRelatorio: TipoRelatorio
  dataGeracao: string
  parametrosFiltro?: string
  resultado?: unknown
}

// ── Request / Response DTOs ───────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface CreateUsuarioRequest {
  nome: string
  email: string
  senha: string
  perfil?: Perfil
  matricula?: string
  cpf?: string
}

/** API PUT /usuarios/:id only accepts nome and email */
export interface UpdateUsuarioRequest {
  nome?: string
  email?: string
}

export interface CreateAtestadoRequest {
  usuarioId: number
  periodo: string
  motivo: string
  arquivoAnexo?: string
  cronogramaId?: number
}

export interface UpdateStatusRequest {
  status: StatusAtestado
  justificativaRecusa?: string
}

export interface CreateTurmaRequest {
  codigoTurma: string
  cursoId: number
  disciplinaId: number
}

/** Property names are defined by the API contract and must not be renamed */
export interface UpdateTurmaRequest {
  /** User IDs to add to the turma */
  conectar?: number[]
  /** User IDs to remove from the turma */
  desconectar?: number[]
}

export interface CreateCronogramaRequest {
  anoLetivo: number
  dataInicioSemestre: string
  dataFimSemestre: string
  periodosAvaliacao: string
}

export interface GenerateRelatorioRequest {
  tipo: TipoRelatorio
  dataInicio?: string
  dataFim?: string
  usuarioId?: number
}

export interface CreateCursoRequest {
  nome: string
}

export interface CreateDisciplinaRequest {
  nome: string
  cargaHoraria: number
}

export interface ListAtestadosParams {
  status?: StatusAtestado
  usuarioId?: number
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/types/index.ts
git commit -m "feat: TypeScript types and DTOs"
```

---

## Task 4: API client

**Files:**
- Create: `src/services/api.ts`

- [ ] **Step 1: Write `src/services/api.ts`**

```ts
import type {
  LoginRequest, LoginResponse,
  Usuario, CreateUsuarioRequest, UpdateUsuarioRequest,
  Atestado, CreateAtestadoRequest, UpdateStatusRequest, ListAtestadosParams,
  Turma, CreateTurmaRequest, UpdateTurmaRequest,
  Notificacao,
  Cronograma, CreateCronogramaRequest,
  Relatorio, GenerateRelatorioRequest,
  Curso, CreateCursoRequest,
  Disciplina, CreateDisciplinaRequest,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY as string

if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL is not set')

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY ?? '',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
    })
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error')
  }

  if (res.status === 204) return undefined as T

  const data: unknown = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      (data as { message?: string; error?: string }).message ??
      (data as { message?: string; error?: string }).error ??
      `HTTP ${res.status}`
    throw new ApiError(res.status, msg)
  }

  return data as T
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const auth = {
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Usuários ──────────────────────────────────────────────────────────────────

export const usuarios = {
  list: () => request<Usuario[]>('/usuarios'),
  get:  (id: number) => request<Usuario>(`/usuarios/${id}`),
  create: (data: CreateUsuarioRequest) =>
    request<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateUsuarioRequest) =>
    request<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/usuarios/${id}`, { method: 'DELETE' }),
}

// ── Atestados ─────────────────────────────────────────────────────────────────

export const atestados = {
  list: (params?: ListAtestadosParams) => {
    const qs = new URLSearchParams()
    if (params?.status)    qs.set('status', params.status)
    if (params?.usuarioId) qs.set('usuarioId', String(params.usuarioId))
    const query = qs.toString() ? `?${qs}` : ''
    return request<Atestado[]>(`/atestados${query}`)
  },
  get: (id: number) => request<Atestado>(`/atestados/${id}`),
  create: (data: CreateAtestadoRequest) =>
    request<Atestado>('/atestados', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, data: UpdateStatusRequest) =>
    request<Atestado>(`/atestados/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/atestados/${id}`, { method: 'DELETE' }),
}

// ── Turmas ────────────────────────────────────────────────────────────────────

export const turmas = {
  list: () => request<Turma[]>('/turmas'),
  get:  (id: number) => request<Turma>(`/turmas/${id}`),
  create: (data: CreateTurmaRequest) =>
    request<Turma>('/turmas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateTurmaRequest) =>
    request<Turma>(`/turmas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/turmas/${id}`, { method: 'DELETE' }),
}

// ── Notificações ──────────────────────────────────────────────────────────────

export const notificacoes = {
  list: (params?: { usuarioId?: number; naoLidas?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.usuarioId) qs.set('usuarioId', String(params.usuarioId))
    if (params?.naoLidas)  qs.set('naoLidas', 'true')
    const query = qs.toString() ? `?${qs}` : ''
    return request<Notificacao[]>(`/notificacoes${query}`)
  },
  markAsRead: (id: number) =>
    request<void>(`/notificacoes/${id}`, { method: 'PATCH', body: JSON.stringify({ lida: true }) }),
}

// ── Cronograma ────────────────────────────────────────────────────────────────

export const cronograma = {
  list:   () => request<Cronograma[]>('/cronograma'),
  create: (data: CreateCronogramaRequest) =>
    request<Cronograma>('/cronograma', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Relatórios ────────────────────────────────────────────────────────────────

export const relatorios = {
  list:     () => request<Relatorio[]>('/relatorios'),
  generate: (data: GenerateRelatorioRequest) =>
    request<Relatorio>('/relatorios', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Cursos ────────────────────────────────────────────────────────────────────

export const cursos = {
  list:   () => request<Curso[]>('/cursos'),
  create: (data: CreateCursoRequest) =>
    request<Curso>('/cursos', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Disciplinas ───────────────────────────────────────────────────────────────

export const disciplinas = {
  list:   () => request<Disciplina[]>('/disciplinas'),
  create: (data: CreateDisciplinaRequest) =>
    request<Disciplina>('/disciplinas', { method: 'POST', body: JSON.stringify(data) }),
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/services/api.ts
git commit -m "feat: API client with all endpoint namespaces"
```

---

## Task 5: Auth context + useApi hook

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/hooks/useApi.ts`

- [ ] **Step 1: Write `src/contexts/AuthContext.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `src/hooks/useApi.ts`**

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseApiResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useApi<T>(fetcher: () => Promise<T>): UseApiResult<T> {
  const [data, setData]         = useState<T | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [trigger, setTrigger]   = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcherRef.current()
      .then(result => { if (!cancelled) { setData(result); setLoading(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [trigger])

  const refetch = useCallback(() => setTrigger(t => t + 1), [])

  return { data, isLoading, error, refetch }
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/contexts/AuthContext.tsx src/hooks/useApi.ts
git commit -m "feat: auth context and useApi hook"
```

---

## Task 6: Shared UI components

**Files:**
- Create: `src/components/ui.tsx`

- [ ] **Step 1: Write `src/components/ui.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/ui.tsx
git commit -m "feat: shared UI components"
```

---

## Task 7: Sidebar component + protected layout

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `app/(protected)/layout.tsx`

- [ ] **Step 1: Write `src/components/Sidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, BookOpen, Bell,
  Calendar, BarChart2, GraduationCap, BookMarked,
  HelpCircle, LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Painel' },
  { href: '/atestados',    icon: FileText,         label: 'Atestados' },
  { href: '/usuarios',     icon: Users,            label: 'Usuários' },
  { href: '/turmas',       icon: BookMarked,       label: 'Turmas' },
  { href: '/notificacoes', icon: Bell,             label: 'Notificações' },
  { href: '/cronograma',   icon: Calendar,         label: 'Cronograma' },
  { href: '/relatorios',   icon: BarChart2,        label: 'Relatórios' },
  { href: '/cursos',       icon: GraduationCap,    label: 'Cursos' },
  { href: '/disciplinas',  icon: BookOpen,         label: 'Disciplinas' },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AE'

  return (
    <aside className="flex flex-col w-[272px] h-full bg-brand-950 text-brand-300">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-display leading-none">Atestado</p>
            <p className="text-xs text-brand-400 mt-0.5">Gestão Escolar</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
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
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-brand-900 space-y-0.5">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-500/10 hover:text-white transition-all">
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
  )
}
```

- [ ] **Step 2: Write `app/(protected)/layout.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/ui'
import type { ReactNode } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex flex-col w-[272px] animate-fade-in">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(v => !v)} className="btn-ghost p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-sm font-semibold text-gray-900 font-display">Atestado Escolar</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/Sidebar.tsx app/(protected)/layout.tsx
git commit -m "feat: sidebar component and protected layout"
```

---

## Task 8: Root layout + root redirect + Login page

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Write `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Atestado Escolar',
  description: 'Sistema de Gestão de Atestados Acadêmicos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${plusJakarta.variable}`}>
      <body>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Write `app/page.tsx`** (root redirect)

```tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 3: Write `app/(auth)/login/page.tsx`**

```tsx
'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

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
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-display">Bem-vindo de volta</h2>
            <p className="text-sm text-gray-500 mt-1">Entre com suas credenciais para continuar.</p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="mt-6 p-3 bg-gray-100 rounded-xl text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Credenciais de teste:</p>
            <p>admin@escola.edu.br</p>
            <p>Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```powershell
git add app/layout.tsx app/page.tsx "app/(auth)/login/page.tsx"
git commit -m "feat: root layout, redirect, and login page"
```

---

## Task 9: Dashboard page

**Files:**
- Create: `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Write `app/(protected)/dashboard/page.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/dashboard/page.tsx"
git commit -m "feat: dashboard page"
```

---

## Task 10: Usuarios page

**Files:**
- Create: `app/(protected)/usuarios/page.tsx`

- [ ] **Step 1: Write `app/(protected)/usuarios/page.tsx`** — copy exact content from the Vite plan's Task 13 `src/pages/Usuarios.tsx`, but:
  1. Add `'use client'` as the first line
  2. Change `export default function Usuarios()` to `export default function UsuariosPage()`
  3. All imports remain the same (they use `@/` aliases)

Full file:

```tsx
'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { usuarios as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, PerfilBadge, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Usuario, Perfil, CreateUsuarioRequest, UpdateUsuarioRequest } from '@/types'

const PERFIS: Perfil[] = ['ALUNO','RESPONSAVEL','SECRETARIA','COORDENACAO','DIRECAO','ADMIN']

export default function UsuariosPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser,   setEditUser]   = useState<Usuario | null>(null)
  const [form, setForm] = useState<CreateUsuarioRequest>({ nome:'', email:'', senha:'', perfil:'ALUNO' })
  const [editForm, setEditForm] = useState<UpdateUsuarioRequest>({ nome:'', email:'' })

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Usuário criado!')
      refetch()
      setCreateOpen(false)
      setForm({ nome:'', email:'', senha:'', perfil:'ALUNO' })
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleUpdate() {
    if (!editUser) return
    try {
      await svc.update(editUser.id, editForm)
      toast.success('Usuário atualizado!')
      refetch()
      setEditUser(null)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`Remover ${u.nome}?`)) return
    try {
      await svc.delete(u.id)
      toast.success('Usuário removido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Usuario>[] = [
    { key:'id',       header:'ID',       render: u => <span className="text-gray-400">#{u.id}</span> },
    { key:'nome',     header:'Nome',     render: u => <span className="font-medium">{u.nome}</span> },
    { key:'email',    header:'E-mail',   render: u => u.email },
    { key:'perfil',   header:'Perfil',   render: u => <PerfilBadge perfil={u.perfil} /> },
    { key:'matricula',header:'Matrícula',render: u => u.matricula ?? '—' },
    { key:'acoes',    header:'Ações',    render: u => (
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-1" onClick={() => { setEditUser(u); setEditForm({ nome: u.nome, email: u.email }) }}>
          <Pencil size={15} />
        </button>
        <button className="btn-ghost p-1 text-red-500 hover:bg-red-50" onClick={() => handleDelete(u)}>
          <Trash2 size={15} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Usuários" subtitle="Gerencie os usuários do sistema."
        action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Novo Usuário</button>} />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Usuário">
        <div className="space-y-3">
          {(['nome','email','senha'] as const).map(field => (
            <div key={field}>
              <label className="label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="input-field" type={field === 'senha' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field] ?? ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="label">Perfil</label>
            <select className="select-field" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value as Perfil }))}>
              {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="label">Matrícula (opcional)</label>
            <input className="input-field" value={form.matricula ?? ''} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} /></div>
          <div><label className="label">CPF (opcional)</label>
            <input className="input-field" value={form.cpf ?? ''} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuário">
        <div className="space-y-3">
          <div><label className="label">Nome</label>
            <input className="input-field" value={editForm.nome ?? ''} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} /></div>
          <div><label className="label">E-mail</label>
            <input className="input-field" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setEditUser(null)}>Cancelar</button>
            <button className="btn-primary" onClick={handleUpdate}>Salvar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/usuarios/page.tsx"
git commit -m "feat: usuarios page"
```

---

## Task 11: Atestados page

**Files:**
- Create: `app/(protected)/atestados/page.tsx`

- [ ] **Step 1:** Write the file. Same logic as the Vite plan's Atestados page, with:
  - `'use client'` first line
  - `export default function AtestadosPage()`

Full file content is identical to Task 14 of the Vite plan (`src/pages/Atestados.tsx`), with those two changes. (The file is ~130 lines — copy it exactly, add 'use client', rename function.)

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/atestados/page.tsx"
git commit -m "feat: atestados page"
```

---

## Task 12: Turmas page

**Files:**
- Create: `app/(protected)/turmas/page.tsx`

- [ ] **Step 1:** Same pattern — `'use client'`, `export default function TurmasPage()`. Full content from Vite plan Task 15.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/turmas/page.tsx"
git commit -m "feat: turmas page"
```

---

## Task 13: Notificacoes page

**Files:**
- Create: `app/(protected)/notificacoes/page.tsx`

- [ ] **Step 1:** `'use client'`, `export default function NotificacoesPage()`. Content from Vite plan Task 16.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/notificacoes/page.tsx"
git commit -m "feat: notificacoes page"
```

---

## Task 14: Cronograma page

**Files:**
- Create: `app/(protected)/cronograma/page.tsx`

- [ ] **Step 1:** `'use client'`, `export default function CronogramaPage()`. Content from Vite plan Task 17.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/cronograma/page.tsx"
git commit -m "feat: cronograma page"
```

---

## Task 15: Relatorios page

**Files:**
- Create: `app/(protected)/relatorios/page.tsx`

- [ ] **Step 1:** `'use client'`, `export default function RelatoriosPage()`. Content from Vite plan Task 18.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/relatorios/page.tsx"
git commit -m "feat: relatorios page"
```

---

## Task 16: Cursos page

**Files:**
- Create: `app/(protected)/cursos/page.tsx`

- [ ] **Step 1:** `'use client'`, `export default function CursosPage()`. Content from Vite plan Task 19.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/cursos/page.tsx"
git commit -m "feat: cursos page"
```

---

## Task 17: Disciplinas page

**Files:**
- Create: `app/(protected)/disciplinas/page.tsx`

- [ ] **Step 1:** `'use client'`, `export default function DisciplinasPage()`. Content from Vite plan Task 20.

- [ ] **Step 2: Commit**

```powershell
git add "app/(protected)/disciplinas/page.tsx"
git commit -m "feat: disciplinas page"
```

---

## Task 18: Build verification

- [ ] **Step 1: Type-check**

```powershell
npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 2: Production build**

```powershell
npm run build
```
Expected: `Route (app)` table with all 11 routes listed, no build errors.

- [ ] **Step 3: Add API key and run dev server**

Fill `NEXT_PUBLIC_API_KEY` in `.env.local`, then:
```powershell
npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 4: Smoke test checklist**

- [ ] `http://localhost:3000` → redirects to `/login`
- [ ] Login with `admin@escola.edu.br` / `Admin@123` → redirects to `/dashboard`
- [ ] Dashboard stat cards load and link to their pages
- [ ] Sidebar active link highlights correctly on each page
- [ ] Logout clears session → redirects to `/login`
- [ ] Direct `/dashboard` access without login → redirects to `/login`
- [ ] Usuarios: list, create, edit, delete
- [ ] Atestados: list, filter by status, create, update status, delete
- [ ] Turmas: create, connect aluno, disconnect aluno
- [ ] Notificações: toggle unread, mark as read
- [ ] Cronograma: create
- [ ] Relatórios: generate (both types)
- [ ] Cursos: create
- [ ] Disciplinas: create
- [ ] Mobile sidebar toggle works

- [ ] **Step 5: Final commit**

```powershell
git add .
git commit -m "feat: complete atestado escolar next.js frontend"
```

---

## Key differences from the Vite plan

| Concern | Vite | Next.js |
|---|---|---|
| Routing | React Router DOM | Next.js App Router (file-based) |
| Protected routes | `<ProtectedRoute>` wrapper | `app/(protected)/layout.tsx` with `useEffect` redirect |
| Active link detection | `NavLink` isActive | `usePathname()` comparison |
| Navigation | `useNavigate()` | `useRouter()` from `next/navigation` |
| Links | `<Link to=...>` | `<Link href=...>` from `next/link` |
| Fonts | Google Fonts CDN in index.html | `next/font/google` (self-hosted, variable CSS props) |
| Env vars | `VITE_*` / `import.meta.env` | `NEXT_PUBLIC_*` / `process.env` |
| Client components | All components implicit | `'use client'` directive required |
| API client env guard | `import.meta.env.VITE_API_BASE_URL` | `process.env.NEXT_PUBLIC_API_BASE_URL` |
