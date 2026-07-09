"use client";

import { useState } from "react";
import Link from "next/link";

export function LoginForm() {
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
