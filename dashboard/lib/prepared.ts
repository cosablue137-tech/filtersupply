// 「準備済み」チェックの共有保存（Upstash Redis）。
// 発送処理は Shopify のみで行う方針のため、ここは梱包準備の進捗フラグだけを扱う。

import { Redis } from "@upstash/redis";

const KEY = "prepared:orders"; // 準備済み注文IDの集合(SET)

function client(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isConfigured(): boolean {
  return client() !== null;
}

export async function getPrepared(): Promise<string[]> {
  const r = client();
  if (!r) return [];
  return await r.smembers(KEY);
}

export async function setPrepared(id: string, prepared: boolean): Promise<void> {
  const r = client();
  if (!r) throw new Error("保存先(Redis)が未設定です");
  if (prepared) await r.sadd(KEY, id);
  else await r.srem(KEY, id);
}
