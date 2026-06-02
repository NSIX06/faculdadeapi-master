import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireAdmin } from "@/lib/auth";
import { VALID_SCOPES } from "@/lib/scopes";

type Ctx = { params: Promise<{ id: string }> };

const UpdateKeySchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  scopes: z.array(z.enum(VALID_SCOPES)).min(1).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

/** Detalhes de uma key específica. */
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireAdmin(auth);
  if (err) return err;

  const { id } = await params;
  const key = await prisma.apiKey.findUnique({
    where: { id: parseInt(id) },
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

  if (!key) return NextResponse.json({ error: "key não encontrada" }, { status: 404 });
  return NextResponse.json(key);
}

/** Atualiza nome, escopos ou status ativo de uma key. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireAdmin(auth);
  if (err) return err;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    const key = await prisma.apiKey.update({
      where: { id: parseInt(id) },
      data: parsed.data,
      select: { id: true, name: true, prefix: true, scopes: true, isActive: true, expiresAt: true },
    });
    return NextResponse.json(key);
  } catch {
    return NextResponse.json({ error: "key não encontrada" }, { status: 404 });
  }
}

/** Revoga (desativa permanentemente) uma API key. */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireAdmin(auth);
  if (err) return err;

  const { id } = await params;
  try {
    await prisma.apiKey.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "key não encontrada" }, { status: 404 });
  }
}
