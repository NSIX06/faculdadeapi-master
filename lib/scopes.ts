export const VALID_SCOPES = [
  "usuarios:read",
  "usuarios:write",
  "usuarios:delete",
  "atestados:read",
  "atestados:write",
  "atestados:delete",
  "turmas:read",
  "turmas:write",
  "turmas:delete",
  "notificacoes:read",
  "notificacoes:write",
  "cronograma:read",
  "cronograma:write",
  "relatorios:read",
  "cursos:read",
  "cursos:write",
  "disciplinas:read",
  "disciplinas:write",
  "*", // acesso total — só para keys de admin
] as const;

export type Scope = (typeof VALID_SCOPES)[number];

export function hasScope(scopes: string[], required: string): boolean {
  return scopes.includes("*") || scopes.includes(required);
}
