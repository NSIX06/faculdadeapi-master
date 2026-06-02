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

export interface ListAtestadosParams {
  status?: StatusAtestado
  usuarioId?: number
}
