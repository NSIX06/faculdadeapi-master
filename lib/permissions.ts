import type { Perfil } from '@/types'

// Pages each role can access
export const ALLOWED_PAGES: Record<Perfil, string[]> = {
  ALUNO:       ['/dashboard', '/atestados', '/notificacoes', '/cronograma', '/perfil'],
  RESPONSAVEL: ['/dashboard', '/atestados', '/notificacoes', '/cronograma', '/perfil'],
  SECRETARIA:  ['/dashboard', '/atestados', '/usuarios', '/notificacoes', '/cronograma', '/relatorios', '/perfil'],
  COORDENACAO: ['/dashboard', '/atestados', '/usuarios', '/turmas', '/notificacoes', '/cronograma', '/relatorios', '/cursos', '/disciplinas', '/perfil'],
  DIRECAO:     ['/dashboard', '/atestados', '/usuarios', '/turmas', '/notificacoes', '/cronograma', '/relatorios', '/cursos', '/disciplinas', '/perfil'],
  ADMIN:       ['/dashboard', '/atestados', '/usuarios', '/turmas', '/notificacoes', '/cronograma', '/relatorios', '/cursos', '/disciplinas', '/perfil'],
}

// Granular action permissions
const CAN: Record<string, Perfil[]> = {
  'atestados.viewAll':     ['SECRETARIA', 'COORDENACAO', 'DIRECAO', 'ADMIN'],
  'atestados.delete':      ['DIRECAO', 'ADMIN'],
  'atestados.updateStatus':['SECRETARIA', 'COORDENACAO', 'DIRECAO', 'ADMIN'],
  'usuarios.create':       ['DIRECAO', 'ADMIN'],
  'usuarios.update':       ['SECRETARIA', 'COORDENACAO', 'DIRECAO', 'ADMIN'],
  'usuarios.delete':       ['DIRECAO', 'ADMIN'],
  'turmas.manage':         ['COORDENACAO', 'DIRECAO', 'ADMIN'],
  'relatorios.generate':   ['SECRETARIA', 'COORDENACAO', 'DIRECAO', 'ADMIN'],
  'cursos.create':         ['COORDENACAO', 'DIRECAO', 'ADMIN'],
  'disciplinas.create':    ['COORDENACAO', 'DIRECAO', 'ADMIN'],
}

export function can(perfil: Perfil | undefined | null, action: string): boolean {
  if (!perfil) return false
  return CAN[action]?.includes(perfil) ?? false
}

export function canAccessPage(perfil: Perfil | undefined | null, path: string): boolean {
  if (!perfil) return false
  return ALLOWED_PAGES[perfil]?.some(p => path === p || path.startsWith(p + '/')) ?? false
}
