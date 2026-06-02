import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { PerfilUsuario, Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

const UpdateUsuarioSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  perfil: z.nativeEnum(PerfilUsuario).optional(),
  matricula: z.string().optional(),
  cpf: z.string().optional(),
  ramal: z.string().optional(),
  departamento: z.string().optional(),
  codigoDiretoria: z.string().optional(),
});

const select = {
  id: true, nome: true, email: true, perfil: true,
  matricula: true, cpf: true, ramal: true, departamento: true,
  codigoDiretoria: true, createdAt: true, updatedAt: true,
};

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "usuarios:read");
  if (err) return err;

  const { id } = await params;
  const usuario = await prisma.usuario.findUnique({ where: { id: +id }, select });
  if (!usuario) return NextResponse.json({ error: "usuário não encontrado" }, { status: 404 });
  return NextResponse.json(usuario);
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "usuarios:write");
  if (err) return err;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { senha, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (senha) data.senhaHash = await bcrypt.hash(senha, 12);

  try {
    const usuario = await prisma.usuario.update({ where: { id: +id }, data, select });
    return NextResponse.json(usuario);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return NextResponse.json({ error: "usuário não encontrado" }, { status: 404 });
      if (err.code === "P2002") return NextResponse.json({ error: "email ou matrícula/CPF já em uso" }, { status: 409 });
    }
    throw err as Error;
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "usuarios:delete");
  if (err) return err;

  const { id } = await params;
  try {
    await prisma.usuario.delete({ where: { id: +id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "usuário não encontrado" }, { status: 404 });
    }
    throw err as Error;
  }
}
