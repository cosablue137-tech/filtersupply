"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "ログインに失敗しました");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-bold text-ink">Filter Supply</h1>
        <p className="mb-6 text-sm text-black/50">売上ダッシュボード</p>
        <label className="mb-2 block text-sm font-medium text-ink">合い言葉</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-lg border border-black/15 px-3 py-2 text-ink outline-none focus:border-ink"
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ink py-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "確認中…" : "入る"}
        </button>
      </form>
    </main>
  );
}
