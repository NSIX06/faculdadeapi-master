# Atestado Escolar Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete React SPA at `C:\Users\felip\Downloads\atestado-escolar-frontend` consuming the Atestado Escolar REST API (`https://faculdadeapi.vercel.app/api`) with 10 pages covering the full academic certificate workflow.

**Architecture:** Thin pages composed from a typed `api.ts` service layer, a generic `useApi` hook, React context for auth, and shared UI primitives in `ui.tsx`. All HTTP calls centralized; all mutations follow try/toast/refetch pattern.

**Tech Stack:** Vite 5, React 18, TypeScript 5, TailwindCSS 3, React Router DOM v6, react-hot-toast, lucide-react, clsx, date-fns

---

## File Map

| File | Responsibility |
|---|---|
| `vite.config.ts` | Build config + `@` path alias |
| `tailwind.config.js` | Brand colors + font families |
| `tsconfig.json` | TS strict config + `@/*` alias |
| `index.html` | Entry HTML + Google Fonts import |
| `.env` / `.env.example` | API base URL + API key env vars |
| `src/index.css` | Tailwind directives + utility classes + animations |
| `src/types/index.ts` | All TS interfaces, enums, DTOs |
| `src/services/api.ts` | HTTP client, ApiError, all endpoint namespaces |
| `src/contexts/AuthContext.tsx` | Auth state, login/logout, useAuth hook |
| `src/hooks/useApi.ts` | Generic async data fetching with refetch |
| `src/components/ui.tsx` | Modal, StatusBadge, PerfilBadge, DataTable, PageHeader, EmptyState, Loading |
| `src/components/Layout.tsx` | Sidebar + top header + Outlet shell + mobile overlay |
| `src/components/ProtectedRoute.tsx` | Redirect to /login if unauthenticated |
| `src/App.tsx` | React Router route tree |
| `src/main.tsx` | ReactDOM.createRoot entry point |
| `src/pages/Login.tsx` | Split-screen login form |
| `src/pages/Dashboard.tsx` | Stats cards + recent atestados + status breakdown |
| `src/pages/Usuarios.tsx` | User list + create/edit/delete modals |
| `src/pages/Atestados.tsx` | Card grid + status filter + create/detail modals |
| `src/pages/Turmas.tsx` | Card grid + create + aluno connect/disconnect modal |
| `src/pages/Notificacoes.tsx` | Notification list + unread toggle + mark-read |
| `src/pages/Cronograma.tsx` | Schedule table + create modal |
| `src/pages/Relatorios.tsx` | Report cards + generate modal |
| `src/pages/Cursos.tsx` | Course table + create modal |
| `src/pages/Disciplinas.tsx` | Subject table + create modal |

---

## Task 1: Scaffold project and install dependencies

**Files:**
- Create: `C:\Users\felip\Downloads\atestado-escolar-frontend\` (entire project)

- [ ] **Step 1: Scaffold Vite project**

Run in `C:\Users\felip\Downloads\`:
```powershell
npm create vite@latest atestado-escolar-frontend -- --template react-ts
```

- [ ] **Step 2: Install runtime dependencies**

```powershell
cd atestado-escolar-frontend
npm install react-router-dom react-hot-toast lucide-react date-fns clsx
```

- [ ] **Step 3: Install dev dependencies**

```powershell
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 4: Create folder structure**

```powershell
mkdir src\types, src\services, src\contexts, src\hooks, src\components, src\pages
```

- [ ] **Step 5: Commit**

```powershell
git init
git add .
git commit -m "chore: scaffold vite react-ts project"
```

---

## Task 2: Configure tooling (Tailwind, paths, fonts, env)

**Files:**
- Modify: `tailwind.config.js`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Modify: `index.html`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore` (update)

- [ ] **Step 1: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Update `tsconfig.json`** — add `baseUrl` and `paths` inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

Install path types if missing:
```powershell
npm install -D @types/node
```

- [ ] **Step 4: Update `index.html`** — replace `<head>` content:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
    <title>Atestado Escolar</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.env`**

```
VITE_API_BASE_URL=https://faculdadeapi.vercel.app/api
VITE_API_KEY=
```

- [ ] **Step 6: Create `.env.example`**

```
VITE_API_BASE_URL=https://faculdadeapi.vercel.app/api
VITE_API_KEY=your_api_key_here
```

- [ ] **Step 7: Ensure `.env` is in `.gitignore`** — open `.gitignore` and confirm `.env` is listed (Vite scaffold adds it by default; if not, add it).

- [ ] **Step 8: Commit**

```powershell
git add .
git commit -m "chore: configure tailwind, path alias, fonts, env"
```

---

## Task 3: Global CSS

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Write `src/index.css`**

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
           rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all duration-150;
  }
  .input-field {
    @apply w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
           placeholder:text-gray-400 transition-shadow;
  }
  .select-field {
    @apply w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
           transition-shadow appearance-none cursor-pointer;
  }
  .card {
    @apply bg-white rounded-2xl border border-gray-100 shadow-sm p-6;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
}

@layer utilities {
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-fade-in-delay-1 { animation: fadeIn 0.3s ease-out 0.05s both; }
  .animate-fade-in-delay-2 { animation: fadeIn 0.3s ease-out 0.10s both; }
  .animate-fade-in-delay-3 { animation: fadeIn 0.3s ease-out 0.15s both; }
  .animate-fade-in-delay-4 { animation: fadeIn 0.3s ease-out 0.20s both; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/index.css
git commit -m "feat: global CSS utility classes and animations"
```

---

## Task 4: TypeScript types

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
  tipoRelatorio: string
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

export interface UpdateTurmaRequest {
  conectar?: number[]
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/types/index.ts
git commit -m "feat: TypeScript types and DTOs"
```

---

## Task 5: API client

**Files:**
- Create: `src/services/api.ts`

- [ ] **Step 1: Write `src/services/api.ts`**

```ts
import type {
  LoginRequest, LoginResponse,
  Usuario, CreateUsuarioRequest, UpdateUsuarioRequest,
  Atestado, CreateAtestadoRequest, UpdateStatusRequest,
  Turma, CreateTurmaRequest, UpdateTurmaRequest,
  Notificacao,
  Cronograma, CreateCronogramaRequest,
  Relatorio, GenerateRelatorioRequest,
  Curso, CreateCursoRequest,
  Disciplina, CreateDisciplinaRequest,
} from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
const API_KEY  = import.meta.env.VITE_API_KEY as string

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('jwt_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  })

  if (res.status === 204) return null as T

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
  list: (params?: { status?: string; usuarioId?: number }) => {
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

## Task 6: Auth context

**Files:**
- Create: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Write `src/contexts/AuthContext.tsx`**

```tsx
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
  const [user, setUser]       = useState<Usuario | null>(null)
  const [token, setToken]     = useState<string | null>(null)
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

- [ ] **Step 2: Commit**

```powershell
git add src/contexts/AuthContext.tsx
git commit -m "feat: auth context with login/logout and localStorage persistence"
```

---

## Task 7: useApi hook

**Files:**
- Create: `src/hooks/useApi.ts`

- [ ] **Step 1: Write `src/hooks/useApi.ts`**

```ts
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

  // Keep a stable ref to the fetcher so the effect doesn't re-run on every render
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

- [ ] **Step 2: Commit**

```powershell
git add src/hooks/useApi.ts
git commit -m "feat: useApi generic data-fetching hook with refetch"
```

---

## Task 8: Shared UI components

**Files:**
- Create: `src/components/ui.tsx`

- [ ] **Step 1: Write `src/components/ui.tsx`**

```tsx
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-xl animate-fade-in',
          modalSizes[size],
        )}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={18} />
          </button>
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
  RECEBIDO:   'Recebido',
  EM_ANALISE: 'Em Análise',
  APROVADO:   'Aprovado',
  RECUSADO:   'Recusado',
}

export function StatusBadge({ status }: { status: StatusAtestado }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

// ── PerfilBadge ───────────────────────────────────────────────────────────────

const perfilStyles: Record<Perfil, string> = {
  ADMIN:       'bg-gray-900 text-white',
  DIRECAO:     'bg-purple-100 text-purple-700',
  COORDENACAO: 'bg-brand-100 text-brand-700',
  SECRETARIA:  'bg-teal-100 text-teal-700',
  RESPONSAVEL: 'bg-orange-100 text-orange-700',
  ALUNO:       'bg-sky-100 text-sky-700',
}

export function PerfilBadge({ perfil }: { perfil: Perfil }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        perfilStyles[perfil],
      )}
    >
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
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(row => (
            <tr key={String(row[keyField])} className="bg-white hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
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
git commit -m "feat: shared UI components (Modal, badges, DataTable, etc.)"
```

---

## Task 9: Layout and ProtectedRoute

**Files:**
- Create: `src/components/Layout.tsx`
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Write `src/components/ProtectedRoute.tsx`**

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/ui'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loading /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

- [ ] **Step 2: Write `src/components/Layout.tsx`**

```tsx
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, BookOpen, Bell,
  Calendar, BarChart2, GraduationCap, BookMarked,
  HelpCircle, LogOut, Menu, X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Painel' },
  { to: '/atestados',    icon: FileText,         label: 'Atestados' },
  { to: '/usuarios',     icon: Users,            label: 'Usuários' },
  { to: '/turmas',       icon: BookMarked,       label: 'Turmas' },
  { to: '/notificacoes', icon: Bell,             label: 'Notificações' },
  { to: '/cronograma',   icon: Calendar,         label: 'Cronograma' },
  { to: '/relatorios',   icon: BarChart2,        label: 'Relatórios' },
  { to: '/cursos',       icon: GraduationCap,    label: 'Cursos' },
  { to: '/disciplinas',  icon: BookOpen,         label: 'Disciplinas' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'AE'

  const Sidebar = (
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
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-500/20 text-white'
                  : 'text-brand-300 hover:bg-brand-500/10 hover:text-white',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-brand-900 space-y-0.5">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-brand-500/10 hover:text-white transition-all">
          <HelpCircle size={18} />
          Ajuda
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-brand-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut size={18} />
          Sair
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex flex-col w-[272px] animate-fade-in">
            {Sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-sm font-semibold text-gray-900 font-display">Atestado Escolar</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/Layout.tsx src/components/ProtectedRoute.tsx
git commit -m "feat: Layout with sidebar and ProtectedRoute guard"
```

---

## Task 10: App routing and main entry

**Files:**
- Modify: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import App from '@/App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Write `src/App.tsx`**

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Usuarios from '@/pages/Usuarios'
import Atestados from '@/pages/Atestados'
import Turmas from '@/pages/Turmas'
import Notificacoes from '@/pages/Notificacoes'
import Cronograma from '@/pages/Cronograma'
import Relatorios from '@/pages/Relatorios'
import Cursos from '@/pages/Cursos'
import Disciplinas from '@/pages/Disciplinas'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/usuarios"     element={<Usuarios />} />
        <Route path="/atestados"    element={<Atestados />} />
        <Route path="/turmas"       element={<Turmas />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/cronograma"   element={<Cronograma />} />
        <Route path="/relatorios"   element={<Relatorios />} />
        <Route path="/cursos"       element={<Cursos />} />
        <Route path="/disciplinas"  element={<Disciplinas />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 3: Delete the Vite default files** that would cause TypeScript errors:

```powershell
Remove-Item src\App.css -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Commit**

```powershell
git add src/main.tsx src/App.tsx
git commit -m "feat: app routing and entry point"
```

---

## Task 11: Login page

**Files:**
- Create: `src/pages/Login.tsx`

- [ ] **Step 1: Write `src/pages/Login.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, senha })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left decorative half */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-950 p-12"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, #157a52 0%, #052e16 70%)' }}>
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
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="seu@email.edu.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="senha">Senha</label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
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

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Login.tsx
git commit -m "feat: login page with split layout"
```

---

## Task 12: Dashboard page

**Files:**
- Create: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Write `src/pages/Dashboard.tsx`**

```tsx
import { Link } from 'react-router-dom'
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

export default function Dashboard() {
  const { user } = useAuth()
  const { data: atestadosList, isLoading: loadingA } = useApi(() => atestados.list())
  const { data: usuariosList,  isLoading: loadingU } = useApi(() => usuarios.list())
  const { data: turmasList,    isLoading: loadingT } = useApi(() => turmas.list())
  const { data: notifList,     isLoading: loadingN } = useApi(() => notificacoes.list())

  const total       = atestadosList?.length ?? 0
  const naoLidas    = notifList?.filter(n => !n.lida).length ?? 0
  const recentes    = [...(atestadosList ?? [])].sort((a, b) =>
    new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
  ).slice(0, 5)

  const stats = [
    { label: 'Atestados',     value: total,                     icon: FileText,  to: '/atestados',    color: 'text-blue-500',   bg: 'bg-blue-50' },
    { label: 'Usuários',      value: usuariosList?.length ?? 0, icon: Users,     to: '/usuarios',     color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Turmas',        value: turmasList?.length ?? 0,   icon: BookMarked,to: '/turmas',       color: 'text-brand-500',  bg: 'bg-brand-50' },
    { label: 'Notificações',  value: naoLidas,                  icon: Bell,      to: '/notificacoes', color: 'text-amber-500',  bg: 'bg-amber-50' },
  ]

  if (loadingA && loadingU && loadingT && loadingN) return <Loading />

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          {user ? greeting(user.nome) : 'Bem-vindo!'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Confira o status das suas solicitações acadêmicas hoje.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, to, color, bg }, i) => (
          <Link
            key={label}
            to={to}
            className={`card hover:shadow-md transition-shadow animate-fade-in-delay-${i + 1}`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-display">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent atestados */}
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

        {/* Status breakdown */}
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
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[s]} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
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
git add src/pages/Dashboard.tsx
git commit -m "feat: dashboard with stats cards and status breakdown"
```

---

## Task 13: Usuários page

**Files:**
- Create: `src/pages/Usuarios.tsx`

- [ ] **Step 1: Write `src/pages/Usuarios.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { usuarios as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, PerfilBadge, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Usuario, Perfil, CreateUsuarioRequest, UpdateUsuarioRequest } from '@/types'

const PERFIS: Perfil[] = ['ALUNO','RESPONSAVEL','SECRETARIA','COORDENACAO','DIRECAO','ADMIN']

export default function Usuarios() {
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
      <PageHeader
        title="Usuários"
        subtitle="Gerencie os usuários do sistema."
        action={
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Novo Usuário
          </button>
        }
      />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Usuário">
        <div className="space-y-3">
          {(['nome','email','senha'] as const).map(field => (
            <div key={field}>
              <label className="label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className="input-field"
                type={field === 'senha' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field] ?? ''}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="label">Perfil</label>
            <select className="select-field" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value as Perfil }))}>
              {PERFIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Matrícula (opcional)</label>
            <input className="input-field" value={form.matricula ?? ''} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} />
          </div>
          <div>
            <label className="label">CPF (opcional)</label>
            <input className="input-field" value={form.cpf ?? ''} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuário">
        <div className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input className="input-field" value={editForm.nome ?? ''} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input-field" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
          </div>
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
git add src/pages/Usuarios.tsx
git commit -m "feat: usuarios page with CRUD modals"
```

---

## Task 14: Atestados page

**Files:**
- Create: `src/pages/Atestados.tsx`

- [ ] **Step 1: Write `src/pages/Atestados.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Eye, Trash2, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { atestados as svc, usuarios } from '@/services/api'
import { Modal, StatusBadge, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { Atestado, StatusAtestado, CreateAtestadoRequest, UpdateStatusRequest } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'RECEBIDO',   label: 'Recebido' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'APROVADO',   label: 'Aprovado' },
  { value: 'RECUSADO',   label: 'Recusado' },
]

export default function Atestados() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, refetch } = useApi(
    () => svc.list(statusFilter ? { status: statusFilter } : undefined),
  )
  const { data: userList } = useApi(() => usuarios.list())
  const alunos = (userList ?? []).filter(u => u.perfil === 'ALUNO')

  const [createOpen, setCreateOpen]   = useState(false)
  const [detailItem, setDetailItem]   = useState<Atestado | null>(null)
  const [form, setForm]               = useState<CreateAtestadoRequest>({ usuarioId: 0, periodo: '', motivo: '' })
  const [statusForm, setStatusForm]   = useState<UpdateStatusRequest>({ status: 'RECEBIDO' })

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Atestado enviado!')
      refetch()
      setCreateOpen(false)
      setForm({ usuarioId: 0, periodo: '', motivo: '' })
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
    if (!confirm('Remover este atestado?')) return
    try {
      await svc.delete(a.id)
      toast.success('Atestado removido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
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

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={16} className="text-gray-400" />
        <select
          className="select-field max-w-[180px]"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setTimeout(refetch, 0) }}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
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
                    <span className="text-xs text-gray-400">#{a.id}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.motivo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.periodo}</p>
                  </div>
                  {a.justificativaRecusa && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      {a.justificativaRecusa}
                    </p>
                  )}
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                    <button className="btn-ghost text-xs px-2 py-1" onClick={() => { setDetailItem(a); setStatusForm({ status: a.status }) }}>
                      <Eye size={14} /> Detalhes
                    </button>
                    <button className="btn-ghost text-xs px-2 py-1 text-red-500" onClick={() => handleDelete(a)}>
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Atestado">
        <div className="space-y-3">
          <div>
            <label className="label">Aluno</label>
            <select className="select-field" value={form.usuarioId || ''} onChange={e => setForm(f => ({ ...f, usuarioId: Number(e.target.value) }))}>
              <option value="">Selecione...</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Período</label>
            <input className="input-field" placeholder="dd/mm/aaaa a dd/mm/aaaa" value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} />
          </div>
          <div>
            <label className="label">Motivo</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          </div>
          <div>
            <label className="label">URL do Anexo (opcional)</label>
            <input className="input-field" type="url" placeholder="https://..." value={form.arquivoAnexo ?? ''} onChange={e => setForm(f => ({ ...f, arquivoAnexo: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Enviar Atestado</button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Detalhes do Atestado" size="lg">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Motivo</p><p className="font-medium">{detailItem.motivo}</p></div>
              <div><p className="text-xs text-gray-400">Período</p><p className="font-medium">{detailItem.periodo}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><StatusBadge status={detailItem.status} /></div>
              <div><p className="text-xs text-gray-400">Emissão</p><p className="font-medium">{new Date(detailItem.dataEmissao).toLocaleDateString('pt-BR')}</p></div>
              {detailItem.arquivoAnexo && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Anexo</p>
                  <a href={detailItem.arquivoAnexo} target="_blank" rel="noreferrer" className="text-brand-600 text-sm underline">Ver documento</a>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Atualizar Status</p>
              <div className="space-y-3">
                <select
                  className="select-field"
                  value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value as StatusAtestado }))}
                >
                  {(['RECEBIDO','EM_ANALISE','APROVADO','RECUSADO'] as StatusAtestado[]).map(s => (
                    <option key={s} value={s}>{s}</option>
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
          </div>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Atestados.tsx
git commit -m "feat: atestados page with card grid and status update"
```

---

## Task 15: Turmas page

**Files:**
- Create: `src/pages/Turmas.tsx`

- [ ] **Step 1: Write `src/pages/Turmas.tsx`**

```tsx
import { useState } from 'react'
import { Plus, Settings, Trash2, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { turmas as svc, cursos, disciplinas, usuarios } from '@/services/api'
import { Modal, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { Turma, CreateTurmaRequest } from '@/types'

export default function Turmas() {
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
      const updated = (await svc.get(manageTurma.id))
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Turmas.tsx
git commit -m "feat: turmas page with connect/disconnect alunos"
```

---

## Task 16: Notificações page

**Files:**
- Create: `src/pages/Notificacoes.tsx`

- [ ] **Step 1: Write `src/pages/Notificacoes.tsx`**

```tsx
import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useApi } from '@/hooks/useApi'
import { notificacoes as svc } from '@/services/api'
import { PageHeader, Loading, EmptyState } from '@/components/ui'

export default function Notificacoes() {
  const [naoLidas, setNaoLidas] = useState(false)
  const { data, isLoading, refetch } = useApi(() => svc.list(naoLidas ? { naoLidas: true } : undefined))

  async function handleRead(id: number) {
    try {
      await svc.markAsRead(id)
      toast.success('Marcado como lido.')
      refetch()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Notificações" subtitle="Acompanhe seus avisos e atualizações." />

      <div className="flex items-center gap-2 mb-5">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
          <div
            onClick={() => { setNaoLidas(v => !v); setTimeout(refetch, 0) }}
            className={clsx(
              'w-10 h-5 rounded-full transition-colors cursor-pointer relative',
              naoLidas ? 'bg-brand-500' : 'bg-gray-200',
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
                      ? 'border-brand-200 bg-brand-50 border-l-4 border-l-brand-500'
                      : 'border-gray-100 bg-white opacity-60',
                  )}
                >
                  <Bell size={16} className={n.lida ? 'text-gray-300 mt-0.5' : 'text-brand-500 mt-0.5'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{n.mensagem}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(n.dataEnvio).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{n.tipoStatus}</span>
                    </div>
                  </div>
                  {!n.lida && (
                    <button className="btn-ghost p-1 text-brand-600 flex-shrink-0" onClick={() => handleRead(n.id)}>
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Notificacoes.tsx
git commit -m "feat: notificacoes page with toggle and mark-read"
```

---

## Task 17: Cronograma page

**Files:**
- Create: `src/pages/Cronograma.tsx`

- [ ] **Step 1: Write `src/pages/Cronograma.tsx`**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { cronograma as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Cronograma, CreateCronogramaRequest } from '@/types'

export default function CronogramaPage() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CreateCronogramaRequest>({
    anoLetivo: new Date().getFullYear(),
    dataInicioSemestre: '',
    dataFimSemestre: '',
    periodosAvaliacao: '',
  })

  async function handleCreate() {
    try {
      await svc.create(form)
      toast.success('Cronograma criado!')
      refetch()
      setOpen(false)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  const columns: Column<Cronograma>[] = [
    { key:'ano',    header:'Ano Letivo',  render: c => <span className="font-semibold">{c.anoLetivo}</span> },
    { key:'inicio', header:'Início',      render: c => fmt(c.dataInicioSemestre) },
    { key:'fim',    header:'Término',     render: c => fmt(c.dataFimSemestre) },
    { key:'periodos',header:'Períodos de Avaliação', render: c => <span className="text-xs">{c.periodosAvaliacao}</span> },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Cronograma"
        subtitle="Calendário acadêmico semestral."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo Cronograma
          </button>
        }
      />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Cronograma">
        <div className="space-y-3">
          <div>
            <label className="label">Ano Letivo</label>
            <input className="input-field" type="number" value={form.anoLetivo} onChange={e => setForm(f => ({ ...f, anoLetivo: Number(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data de Início</label>
              <input className="input-field" type="date" value={form.dataInicioSemestre} onChange={e => setForm(f => ({ ...f, dataInicioSemestre: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data de Término</label>
              <input className="input-field" type="date" value={form.dataFimSemestre} onChange={e => setForm(f => ({ ...f, dataFimSemestre: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Períodos de Avaliação</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.periodosAvaliacao} onChange={e => setForm(f => ({ ...f, periodosAvaliacao: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Cronograma.tsx
git commit -m "feat: cronograma page"
```

---

## Task 18: Relatórios page

**Files:**
- Create: `src/pages/Relatorios.tsx`

- [ ] **Step 1: Write `src/pages/Relatorios.tsx`**

```tsx
import { useState } from 'react'
import { Plus, BarChart2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { relatorios as svc, usuarios } from '@/services/api'
import { Modal, PageHeader, Loading, EmptyState } from '@/components/ui'
import type { GenerateRelatorioRequest, TipoRelatorio } from '@/types'

export default function Relatorios() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const { data: userList }           = useApi(() => usuarios.list())
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<GenerateRelatorioRequest>({ tipo: 'atestados_por_periodo' })

  async function handleGenerate() {
    try {
      await svc.generate(form)
      toast.success('Relatório gerado!')
      refetch()
      setOpen(false)
      setForm({ tipo: 'atestados_por_periodo' })
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const TIPO_LABELS: Record<TipoRelatorio, string> = {
    atestados_por_periodo: 'Atestados por Período',
    faltas_por_aluno: 'Faltas por Aluno',
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Relatórios"
        subtitle="Gere e consulte relatórios acadêmicos."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Gerar Relatório
          </button>
        }
      />

      {isLoading ? <Loading /> : (
        (data ?? []).length === 0
          ? <EmptyState message="Nenhum relatório gerado ainda." />
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data ?? []).map(r => (
                <div key={r.id} className="card animate-fade-in flex flex-col gap-3">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    {r.tipoRelatorio === 'faltas_por_aluno'
                      ? <Users size={18} className="text-brand-600" />
                      : <BarChart2 size={18} className="text-brand-600" />}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {TIPO_LABELS[r.tipoRelatorio as TipoRelatorio] ?? r.tipoRelatorio}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.dataGeracao).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' })}
                  </p>
                  {r.parametrosFiltro && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1 font-mono">{r.parametrosFiltro}</p>
                  )}
                  {r.resultado !== null && r.resultado !== undefined && (
                    <pre className="text-xs bg-gray-900 text-green-400 rounded-xl p-3 overflow-auto max-h-40 font-mono">
                      {JSON.stringify(r.resultado, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Gerar Relatório">
        <div className="space-y-3">
          <div>
            <label className="label">Tipo</label>
            <select className="select-field" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoRelatorio }))}>
              <option value="atestados_por_periodo">Atestados por Período</option>
              <option value="faltas_por_aluno">Faltas por Aluno</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data Início</label>
              <input className="input-field" type="date" value={form.dataInicio ?? ''} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input className="input-field" type="date" value={form.dataFim ?? ''} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          {form.tipo === 'faltas_por_aluno' && (
            <div>
              <label className="label">Aluno</label>
              <select className="select-field" value={form.usuarioId ?? ''} onChange={e => setForm(f => ({ ...f, usuarioId: Number(e.target.value) }))}>
                <option value="">Selecione...</option>
                {(userList ?? []).filter(u => u.perfil === 'ALUNO').map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleGenerate}>Gerar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Relatorios.tsx
git commit -m "feat: relatorios page with generate modal"
```

---

## Task 19: Cursos page

**Files:**
- Create: `src/pages/Cursos.tsx`

- [ ] **Step 1: Write `src/pages/Cursos.tsx`**

```tsx
import { useState } from 'react'
import { Plus, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { cursos as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Curso } from '@/types'

export default function Cursos() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')

  async function handleCreate() {
    try {
      await svc.create({ nome })
      toast.success('Curso criado!')
      refetch()
      setOpen(false)
      setNome('')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Curso>[] = [
    { key:'id',   header:'ID',   render: c => <span className="text-gray-400">#{c.id}</span> },
    { key:'nome', header:'Nome', render: c => (
      <div className="flex items-center gap-2">
        <GraduationCap size={15} className="text-brand-500" />
        <span className="font-medium">{c.nome}</span>
      </div>
    )},
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Cursos"
        subtitle="Gerencie os cursos da instituição."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo Curso
          </button>
        }
      />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo Curso" size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Nome do Curso</label>
            <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Engenharia de Software" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Cursos.tsx
git commit -m "feat: cursos page"
```

---

## Task 20: Disciplinas page

**Files:**
- Create: `src/pages/Disciplinas.tsx`

- [ ] **Step 1: Write `src/pages/Disciplinas.tsx`**

```tsx
import { useState } from 'react'
import { Plus, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '@/hooks/useApi'
import { disciplinas as svc } from '@/services/api'
import { Modal, DataTable, PageHeader, Loading } from '@/components/ui'
import type { Column } from '@/components/ui'
import type { Disciplina } from '@/types'

export default function Disciplinas() {
  const { data, isLoading, refetch } = useApi(() => svc.list())
  const [open, setOpen]             = useState(false)
  const [nome, setNome]             = useState('')
  const [cargaHoraria, setCarga]    = useState(0)

  async function handleCreate() {
    try {
      await svc.create({ nome, cargaHoraria })
      toast.success('Disciplina criada!')
      refetch()
      setOpen(false)
      setNome('')
      setCarga(0)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') }
  }

  const columns: Column<Disciplina>[] = [
    { key:'id',    header:'ID',    render: d => <span className="text-gray-400">#{d.id}</span> },
    { key:'nome',  header:'Nome',  render: d => (
      <div className="flex items-center gap-2">
        <BookOpen size={15} className="text-brand-500" />
        <span className="font-medium">{d.nome}</span>
      </div>
    )},
    { key:'carga', header:'Carga Horária', render: d => (
      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
        {d.cargaHoraria}h
      </span>
    )},
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Disciplinas"
        subtitle="Gerencie as disciplinas da instituição."
        action={
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> Nova Disciplina
          </button>
        }
      />
      {isLoading ? <Loading /> : <DataTable columns={columns} data={data ?? []} keyField="id" />}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Disciplina" size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Estrutura de Dados" />
          </div>
          <div>
            <label className="label">Carga Horária (horas)</label>
            <input className="input-field" type="number" min={1} value={cargaHoraria || ''} onChange={e => setCarga(Number(e.target.value))} placeholder="Ex: 60" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleCreate}>Criar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/pages/Disciplinas.tsx
git commit -m "feat: disciplinas page"
```

---

## Task 21: Build verification and smoke test

- [ ] **Step 1: Type-check**

```powershell
npx tsc --noEmit
```

Expected: no output (zero errors).

If errors appear, fix them before proceeding. Common issues:
- Unused imports → remove them
- `noUnusedLocals` violations → prefix with `_` or remove
- Missing return type on async functions → add `: Promise<void>`

- [ ] **Step 2: Production build**

```powershell
npx vite build
```

Expected output ends with something like:
```
dist/index.html          x.xx kB
dist/assets/index-xxx.js   xxx kB
✓ built in x.xxs
```

If build fails, check for missing imports or type errors reported in build output.

- [ ] **Step 3: Start dev server and configure API key**

Open `.env` and fill in your API key value for `VITE_API_KEY`.

```powershell
npm run dev
```

Open browser at `http://localhost:5173`.

- [ ] **Step 4: Manual smoke test checklist**

Run through these checks in the browser:

- [ ] Navigate to `http://localhost:5173` → redirects to `/login`
- [ ] Login with `admin@escola.edu.br` / `Admin@123` → redirects to Dashboard
- [ ] Dashboard shows stat cards and atestados recentes
- [ ] Sidebar shows all 9 nav links; active link is highlighted green
- [ ] Click Logout → redirects to `/login`, session cleared
- [ ] Navigate directly to `/dashboard` without login → redirects to `/login`
- [ ] Usuários: list loads, create new user, edit nome/email, delete user
- [ ] Atestados: list loads, filter by status works, create atestado, open detail, change status to APROVADO
- [ ] Atestados: set status to RECUSADO → justificativa textarea appears
- [ ] Turmas: create turma, open manage modal, connect aluno, disconnect aluno
- [ ] Notificações: list loads, toggle "somente não lidas", click check to mark read
- [ ] Cronograma: list loads, create new cronograma
- [ ] Relatórios: list loads, generate report (atestados_por_periodo), generate report (faltas_por_aluno) shows aluno select
- [ ] Cursos: list loads, create curso
- [ ] Disciplinas: list loads, create disciplina with carga horária
- [ ] Sidebar mobile toggle works on narrow viewport (< 1024px)
- [ ] Toast messages appear on success and error actions

- [ ] **Step 5: Final commit**

```powershell
git add .
git commit -m "feat: complete atestado escolar frontend SPA"
```
