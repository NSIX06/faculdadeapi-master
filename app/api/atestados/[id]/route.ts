import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

const include = {
  usuario: { select: { id: true, nome: true, email: true, perfil: true } },
  notificacoes: true,
  cronograma: true,
};

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "atestados:read");
  if (err) return err;

  const { id } = await params;
  const atestado = await prisma.atestado.findUnique({ where: { id: +id }, include });
  if (!atestado) return NextResponse.json({ error: "atestado não encontrado" }, { status: 404 });
  return NextResponse.json(atestado);
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "atestados:delete");
  if (err) return err;

  const { id } = await params;
  try {
    await prisma.atestado.delete({ where: { id: +id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "atestado não encontrado" }, { status: 404 });
    }
    throw err as Error;
  }
}
