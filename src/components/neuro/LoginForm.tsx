"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({ isDev }: { isDev: boolean }) {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function devLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Подтвердите согласие с условиями");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/neuro/chat${data.isNew ? "?welcome=1" : ""}`);
      router.refresh();
    } else {
      setError("Не удалось войти");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6">
      {/* Подарок */}
      <div className="mb-5 rounded-xl bg-blue-50 p-4 text-center">
        <div className="text-base font-semibold text-blue-800">
          🎁 В подарок — 1 бесплатный вопрос нейроюристу
        </div>
        <div className="mt-1 text-sm text-blue-700">
          Начисляется сразу после регистрации.
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-900">Вход и регистрация</h1>
      <p className="mt-1 text-sm text-gray-500">
        Войдите, чтобы задать вопрос нейроюристу.
      </p>

      {/* Согласие */}
      <label className="mt-5 flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          Продолжая, я принимаю{" "}
          <Link href="/politika-konfidencialnosti" className="text-blue-700 underline">
            Политику конфиденциальности
          </Link>{" "}
          и{" "}
          <Link href="/oferta" className="text-blue-700 underline">
            Публичную оферту
          </Link>
          .
        </span>
      </label>

      {/* Яндекс ID */}
      <a
        href={agree ? "/api/auth/yandex/login" : undefined}
        aria-disabled={!agree}
        onClick={(e) => {
          if (!agree) {
            e.preventDefault();
            setError("Подтвердите согласие с условиями");
          }
        }}
        className={`mt-5 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white ${
          agree ? "bg-black hover:bg-gray-800" : "cursor-not-allowed bg-gray-300"
        }`}
      >
        Войти через Яндекс ID
      </a>

      {/* Dev-вход */}
      {isDev && (
        <form onSubmit={devLogin} className="mt-4 border-t border-gray-100 pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Вход для разработки
          </div>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Входим…" : "Войти по email (dev)"}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
