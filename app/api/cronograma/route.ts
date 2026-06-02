import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

const Schema = z.object({
  anoLetivo: z.number().int().min(2000).max(2100),
  dataInicioSemestre: z.coerce.date(),
  dataFimSemestre: z.coerce.date(),
  periodosAvaliacao: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "cronograma:read");
  if (err) return err;

  return NextResponse.json(await prisma.cronograma.findMany({ orderBy: { anoLetivo: "desc" } }));
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "cronograma:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });

  return NextResponse.json(await prisma.cronograma.create({ data: parsed.data }), { status: 201 });
}
