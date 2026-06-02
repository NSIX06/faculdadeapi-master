import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterSpecByScopes } from "@/lib/openapi";

type Ctx = { params: Promise<{ keyId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { keyId } = await params;
  const key = await prisma.apiKey.findUnique({
    where: { id: parseInt(keyId) },
    select: { id: true, name: true, scopes: true, isActive: true },
  });

  if (!key || !key.isActive) {
    return NextResponse.json({ error: "key não encontrada ou inativa" }, { status: 404 });
  }

  const filtered = filterSpecByScopes(key.scopes);

  // Personaliza o título para indicar a quem pertence essa doc
  const spec = {
    ...filtered,
    info: {
      ...filtered.info,
      title: `${filtered.info.title} — ${key.name}`,
      description: `Documentação personalizada gerada para a API Key **${key.name}**.\n\nEsta doc contém apenas os endpoints aos quais essa chave tem acesso.\n\n${filtered.info.description}`,
    },
  };

  return NextResponse.json(spec);
}
