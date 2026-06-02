import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const include = { curso: true, disciplina: true, alunos: { select: { id: true, nome: true, matricula: true } } };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "turmas:read");
  if (err) return err;

  const { id } = await params;
  const turma = await prisma.turma.findUnique({ where: { id: +id }, include });
  if (!turma) return NextResponse.json({ error: "turma não encontrada" }, { status: 404 });
  return NextResponse.json(turma);
}

/** Vincula ou desvincula alunos de uma turma */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "turmas:write");
  if (err) return err;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  const schema = z.object({
    conectar: z.array(z.number().int()).optional(),
    desconectar: z.array(z.number().int()).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "dados inválidos" }, { status: 422 });

  const turma = await prisma.turma.update({
    where: { id: +id },
    data: {
      alunos: {
        connect: parsed.data.conectar?.map((uid) => ({ id: uid })),
        disconnect: parsed.data.desconectar?.map((uid) => ({ id: uid })),
      },
    },
    include,
  });
  return NextResponse.json(turma);
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "turmas:delete");
  if (err) return err;

  const { id } = await params;
  try {
    await prisma.turma.delete({ where: { id: +id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "turma não encontrada" }, { status: 404 });
  }
}
