import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

const Schema = z.object({
  nome: z.string().min(1),
  cargaHoraria: z.number().int().positive(),
});

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "disciplinas:read");
  if (err) return err;

  return NextResponse.json(await prisma.disciplina.findMany({ orderBy: { nome: "asc" } }));
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "disciplinas:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "dados inválidos" }, { status: 422 });

  try {
    return NextResponse.json(await prisma.disciplina.create({ data: parsed.data }), { status: 201 });
  } catch {
    return NextResponse.json({ error: "disciplina já existe" }, { status: 409 });
  }
}
