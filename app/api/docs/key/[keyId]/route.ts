import { ApiReference } from "@scalar/nextjs-api-reference";

type Ctx = { params: Promise<{ keyId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { keyId } = await params;
  const handler = ApiReference({
    spec: { url: `/api/openapi.json/key/${keyId}` },
    theme: "default",
  });
  return handler();
}
