import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** Marca notificação como lida */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "notificacoes:write");
  if (err) return err;

  const { id } = await params;
  try {
    const n = await prisma.notificacao.update({ where: { id: +id }, data: { lida: true } });
    return NextResponse.json(n);
  } catch {
    return NextResponse.json({ error: "notificação não encontrada" }, { status: 404 });
  }
}
