import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { StatusAtestado } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

const StatusSchema = z.object({
  status: z.nativeEnum(StatusAtestado),
  justificativaRecusa: z.string().min(1).optional(),
}).refine(
  (d) => d.status !== StatusAtestado.RECUSADO || !!d.justificativaRecusa,
  { message: "justificativaRecusa é obrigatória ao recusar", path: ["justificativaRecusa"] }
);

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "atestados:write");
  if (err) return err;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const atestado = await prisma.atestado.findUnique({ where: { id: +id } });
  if (!atestado) return NextResponse.json({ error: "atestado não encontrado" }, { status: 404 });

  const updated = await prisma.atestado.update({
    where: { id: +id },
    data: {
      status: parsed.data.status,
      justificativaRecusa: parsed.data.justificativaRecusa ?? null,
    },
    include: { usuario: { select: { id: true, nome: true, email: true } } },
  });

  // Notifica o dono do atestado sobre a mudança de status
  await prisma.notificacao.create({
    data: {
      usuarioId: atestado.usuarioId,
      atestadoId: atestado.id,
      mensagem: `Seu atestado foi atualizado para: ${parsed.data.status}`,
      tipoStatus: parsed.data.status,
    },
  });

  return NextResponse.json(updated);
}
