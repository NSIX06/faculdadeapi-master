import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 422 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: parsed.data.email },
  });

  const senhaOk =
    usuario && (await bcrypt.compare(parsed.data.senha, usuario.senhaHash));

  if (!usuario || !senhaOk) {
    return NextResponse.json({ error: "credenciais inválidas" }, { status: 401 });
  }

  const token = signJwt({ usuarioId: usuario.id, perfil: usuario.perfil });

  return NextResponse.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
  });
}
