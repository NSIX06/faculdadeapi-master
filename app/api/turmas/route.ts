import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

const CreateTurmaSchema = z.object({
  codigoTurma: z.string().min(1),
  cursoId: z.number().int().positive(),
  disciplinaId: z.number().int().positive(),
});

const include = { curso: true, disciplina: true, alunos: { select: { id: true, nome: true, matricula: true } } };

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "turmas:read");
  if (err) return err;

  return NextResponse.json(await prisma.turma.findMany({ include, orderBy: { codigoTurma: "asc" } }));
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "turmas:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = CreateTurmaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  try {
    const turma = await prisma.turma.create({ data: parsed.data, include });
    return NextResponse.json(turma, { status: 201 });
  } catch {
    return NextResponse.json({ error: "código de turma já existe ou curso/disciplina inválidos" }, { status: 409 });
  }
}
