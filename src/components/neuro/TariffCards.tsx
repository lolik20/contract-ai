"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TARIFFS, formatRub, type Tariff } from "@/lib/tariffs";

export function TariffCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {TARIFFS.map((t) => (
        <TariffCard key={t.plan} tariff={t} />
      ))}
    </div>
  );
}

function TariffCard({ tariff }: { tariff: Tariff }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: tariff.plan }),
    });

    if (res.status === 401) {
      router.push("/vhod");
      return;
    }
    const data = await res.json().catch(() => null);
    if (res.ok && data?.paymentUrl) {
      window.location.href = data.paymentUrl;
      return;
    }
    setLoading(false);
    setError(
      data?.error === "payments_not_configured"
        ? "Оплата временно недоступна"
        : "Не удалось начать оплату"
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-5 ${
        tariff.highlighted ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
      }`}
    >
      {tariff.highlighted && (
        <div className="mb-2 inline-block self-start rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
          Выгодно
        </div>
      )}
      <div className="text-lg font-bold text-gray-900">{tariff.title}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">
        {formatRub(tariff.amountKopecks)} ₽
      </div>
      <div className="mt-1 text-sm text-gray-500">
        ≈ {tariff.perQuestionRub} ₽ за вопрос
      </div>
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="mt-5 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {loading ? "Переходим к оплате…" : "Купить"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
