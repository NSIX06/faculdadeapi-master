import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { hashKey } from "./crypto";
import { hasScope } from "./scopes";
import { PerfilUsuario } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_PROFILES: PerfilUsuario[] = [PerfilUsuario.ADMIN, PerfilUsuario.DIRECAO];

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type JwtPayload = { usuarioId: number; perfil: PerfilUsuario };

export type AuthContext =
  | { type: "jwt"; usuarioId: number; perfil: PerfilUsuario; isAdmin: boolean }
  | { type: "api-key"; apiKeyId: number; scopes: string[] };

// ── Helpers públicos ──────────────────────────────────────────────────────────

export function signJwt(payload: JwtPayload, expiresIn = "8h"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/** Extrai e valida o token JWT ou API key do request. Retorna null se inválido. */
export async function getAuth(request: NextRequest): Promise<AuthContext | null> {
  const apiKeyHeader = request.headers.get("x-api-key");
  const authHeader = request.headers.get("authorization");

  if (apiKeyHeader) {
    const keyHash = hashKey(apiKeyHeader);
    const key = await prisma.apiKey.findUnique({ where: { keyHash } });
    if (!key || !key.isActive) return null;
    if (key.expiresAt && key.expiresAt < new Date()) return null;

    // lastUsedAt: fire-and-forget para não bloquear a resposta
    prisma.apiKey
      .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return { type: "api-key", apiKeyId: key.id, scopes: key.scopes };
  }

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return {
        type: "jwt",
        usuarioId: payload.usuarioId,
        perfil: payload.perfil,
        isAdmin: ADMIN_PROFILES.includes(payload.perfil),
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Verifica se o contexto de auth tem o escopo necessário.
 * Usuários JWT admin têm acesso a tudo.
 * Retorna NextResponse de erro ou null (quando ok).
 */
export function requireScope(
  auth: AuthContext | null,
  scope: string
): NextResponse | null {
  if (!auth) {
    return NextResponse.json(
      { error: "autenticação necessária — envie JWT (Authorization: Bearer) ou API key (X-Api-Key)" },
      { status: 401 }
    );
  }

  if (auth.type === "jwt") {
    // Admin bypassa qualquer verificação de escopo
    if (auth.isAdmin) return null;
    // Não-admins com JWT também têm acesso por padrão (controle feito pelo perfil na camada de negócio)
    return null;
  }

  // API key: verifica escopo explicitamente
  if (!hasScope(auth.scopes, scope)) {
    return NextResponse.json(
      { error: "permissão insuficiente", escopoNecessario: scope },
      { status: 403 }
    );
  }

  return null;
}

/** Exige que o contexto seja JWT de admin. Usado para gerenciar API keys. */
export function requireAdmin(auth: AuthContext | null): NextResponse | null {
  if (!auth) {
    return NextResponse.json({ error: "autenticação necessária" }, { status: 401 });
  }
  if (auth.type !== "jwt" || !auth.isAdmin) {
    return NextResponse.json({ error: "acesso restrito a administradores" }, { status: 403 });
  }
  return null;
}
