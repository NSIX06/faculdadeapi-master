import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

const Schema = z.object({ nome: z.string().min(1) });

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "cursos:read");
  if (err) return err;

  return NextResponse.json(await prisma.curso.findMany({ orderBy: { nome: "asc" } }));
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "cursos:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "nome obrigatório" }, { status: 422 });

  try {
    const curso = await prisma.curso.create({ data: parsed.data });
    return NextResponse.json(curso, { status: 201 });
  } catch {
    return NextResponse.json({ error: "curso já existe" }, { status: 409 });
  }
}
