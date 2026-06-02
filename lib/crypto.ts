import { randomBytes, createHash } from "crypto";

export function generateApiKey(): { fullKey: string; prefix: string; keyHash: string } {
  const raw = randomBytes(32).toString("hex");
  const prefix = "sk_" + raw.slice(0, 8);
  const fullKey = prefix + "_" + raw.slice(8);
  const keyHash = hashKey(fullKey);
  return { fullKey, prefix, keyHash };
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
