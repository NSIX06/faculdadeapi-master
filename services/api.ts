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
