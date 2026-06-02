import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { StatusAtestado } from "@prisma/client";

const GerarSchema = z.object({
  tipo: z.enum(["atestados_por_periodo", "faltas_por_aluno"]),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  usuarioId: z.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "relatorios:read");
  if (err) return err;

  return NextResponse.json(await prisma.relatorio.findMany({ orderBy: { dataGeracao: "desc" } }));
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "relatorios:read");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = GerarSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "dados inválidos" }, { status: 422 });

  const { tipo, dataInicio, dataFim, usuarioId } = parsed.data;
  let resultado: unknown;

  if (tipo === "atestados_por_periodo") {
    resultado = await prisma.atestado.groupBy({
      by: ["status"],
      _count: true,
      where: {
        ...(dataInicio && { dataEmissao: { gte: dataInicio } }),
        ...(dataFim && { dataEmissao: { lte: dataFim } }),
      },
    });
  } else {
    resultado = await prisma.atestado.findMany({
      where: {
        status: StatusAtestado.APROVADO,
        ...(usuarioId && { usuarioId }),
        ...(dataInicio && { dataEmissao: { gte: dataInicio } }),
        ...(dataFim && { dataEmissao: { lte: dataFim } }),
      },
      include: { usuario: { select: { id: true, nome: true, matricula: true } } },
    });
  }

  const relatorio = await prisma.relatorio.create({
    data: {
      tipoRelatorio: tipo,
      parametrosFiltro: JSON.stringify({ dataInicio, dataFim, usuarioId }),
      resultado: resultado as object,
    },
  });

  return NextResponse.json({ relatorio, resultado }, { status: 201 });
}
