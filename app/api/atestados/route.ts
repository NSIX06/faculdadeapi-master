import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { StatusAtestado } from "@prisma/client";

const CreateAtestadoSchema = z.object({
  usuarioId: z.number().int().positive(),
  periodo: z.string().min(1),
  motivo: z.string().min(1),
  arquivoAnexo: z.string().url().optional(),
  cronogramaId: z.number().int().positive().optional(),
});

const include = {
  usuario: { select: { id: true, nome: true, email: true, perfil: true } },
  cronograma: { select: { id: true, anoLetivo: true } },
};

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "atestados:read");
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as StatusAtestado | null;
  const usuarioId = searchParams.get("usuarioId");

  const atestados = await prisma.atestado.findMany({
    where: {
      ...(status && { status }),
      ...(usuarioId && { usuarioId: +usuarioId }),
    },
    orderBy: { createdAt: "desc" },
    include,
  });
  return NextResponse.json(atestados);
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "atestados:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = CreateAtestadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const atestado = await prisma.atestado.create({ data: parsed.data, include });
  return NextResponse.json(atestado, { status: 201 });
}
