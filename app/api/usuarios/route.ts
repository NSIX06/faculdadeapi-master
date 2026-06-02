import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuth, requireScope } from "@/lib/auth";
import { PerfilUsuario } from "@prisma/client";

const CreateUsuarioSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.nativeEnum(PerfilUsuario).default(PerfilUsuario.ALUNO),
  matricula: z.string().optional(),
  cpf: z.string().optional(),
  ramal: z.string().optional(),
  departamento: z.string().optional(),
  codigoDiretoria: z.string().optional(),
});

const select = {
  id: true, nome: true, email: true, perfil: true,
  matricula: true, cpf: true, ramal: true, departamento: true,
  codigoDiretoria: true, createdAt: true,
};

export async function GET(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "usuarios:read");
  if (err) return err;

  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" }, select });
  return NextResponse.json(usuarios);
}

export async function POST(request: NextRequest) {
  const auth = await getAuth(request);
  const err = requireScope(auth, "usuarios:write");
  if (err) return err;

  const body = await request.json().catch(() => null);
  const parsed = CreateUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos", detalhes: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { senha, ...rest } = parsed.data;
  const senhaHash = await bcrypt.hash(senha, 12);

  try {
    const usuario = await prisma.usuario.create({ data: { ...rest, senhaHash }, select });
    return NextResponse.json(usuario, { status: 201 });
  } catch {
    return NextResponse.json({ error: "email ou matrícula/CPF já cadastrado" }, { status: 409 });
  }
}
