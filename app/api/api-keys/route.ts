import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireAdmin } from "@/lib/auth";
import { generateApiKey } from "@/lib/crypto";
import { VALID_SCOPES } from "@/lib/scopes";

const CreateKeySchema = z.object({
  name: z.string().min(1, "nome obrigatório"),
  scopes: z
    .array(z.enum(VALID_SCOPES))
    .min(1, "informe ao menos um escopo"),
  expiresAt: z.coerce.date().optional(),
});

/** Lista todas as API keys do sistema (sem expor o hash). */
export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireAdmin(auth);
  if (err) return err;

  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      isActive: true,
      expiresAt: true,
      lastUsedAt: true,
      createdAt: true,
      createdBy: { select: { id: true, nome: true, email: true } },
    },
  });

  return NextResponse.json(keys);
}

/**
 * Cria uma nova API key.
 * A chave completa é retornada UMA ÚNICA VEZ — não é possível recuperá-la depois.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireAdmin(auth);
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = CreateKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Scopes não-admin não podem ter "*"
  if (!auth || auth.type !== "jwt") {
    return NextResponse.json({ error: "JWT necessário" }, { status: 401 });
  }
  if (!auth.isAdmin && parsed.data.scopes.includes("*")) {
    return NextResponse.json(
      { error: 'apenas admins podem criar keys com escopo "*"' },
      { status: 403 }
    );
  }

  const { fullKey, prefix, keyHash } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      prefix,
      keyHash,
      scopes: parsed.data.scopes,
      expiresAt: parsed.data.expiresAt ?? null,
      createdById: auth.usuarioId,
    },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      isActive: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      ...apiKey,
      // Retornado APENAS aqui — guarde em local seguro
      key: fullKey,
      aviso: "Esta é a única vez que a chave completa será exibida. Guarde-a agora.",
    },
    { status: 201 }
  );
}
