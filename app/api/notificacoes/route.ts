import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "notificacoes:read");
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");
  const naoLidas = searchParams.get("naoLidas") === "true";

  const notificacoes = await prisma.notificacao.findMany({
    where: {
      ...(usuarioId && { usuarioId: +usuarioId }),
      ...(naoLidas && { lida: false }),
    },
    orderBy: { dataEnvio: "desc" },
    include: { atestado: { select: { id: true, status: true, motivo: true } } },
  });
  return NextResponse.json(notificacoes);
}
