// 合い言葉（パスワード）1つによる簡易認証。
// ログイン成功時に「署名済みトークン」を httpOnly Cookie に保存し、
// middleware でその署名を検証する。Web Crypto を使うので Edge でも動く。

export const SESSION_COOKIE = "fs_dash_session";

function secret(): string {
  return process.env.DASHBOARD_SESSION_SECRET || "insecure-dev-secret";
}

// 一定の payload を HMAC-SHA256 で署名した16進文字列を返す。
export async function makeToken(): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("filter-supply-dashboard"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await makeToken();
  // 長さが同じ前提でタイミング安全に比較
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw) return false;
  if (input.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ pw.charCodeAt(i);
  }
  return diff === 0;
}
