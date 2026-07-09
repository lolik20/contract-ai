import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTariff, formatRub } from "@/lib/tariffs";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { SiteFooter } from "@/components/neuro/SiteFooter";
import { BalanceBadge } from "@/components/neuro/BalanceBadge";
import { LogoutButton } from "@/components/neuro/LogoutButton";

export const metadata: Metadata = { title: "Личный кабинет" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  SUCCEEDED: "Оплачено",
  FAILED: "Ошибка",
};

export default async function CabinetPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/vhod");

  const [purchases, consultations] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="flex min-h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <LogoutButton />
        </div>

        {/* Баланс */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Остаток:</span>
            <BalanceBadge balance={user.questionBalance} />
          </div>
          <div className="flex gap-2">
            <Link
              href="/neuro/chat"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              К диалогам
            </Link>
            <Link
              href="/tarify"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Пополнить
            </Link>
          </div>
        </div>

        {/* Консультации */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Мои диалоги</h2>
          {consultations.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Диалогов пока нет.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {consultations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/neuro/chat?c=${c.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="truncate text-sm text-gray-800">
                      {c.title || "Без названия"}
                    </span>
                    <span className="ml-3 shrink-0 text-xs text-gray-400">
                      {c.updatedAt.toLocaleDateString("ru-RU")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* История покупок */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">История покупок</h2>
          {purchases.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Покупок пока нет.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {purchases.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-gray-800">
                    {getTariff(p.plan)?.title ?? `${p.questions} вопросов`}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-gray-500">
                      {formatRub(p.amountKopecks)} ₽
                    </span>
                    <span
                      className={
                        p.status === "SUCCEEDED"
                          ? "text-green-600"
                          : p.status === "FAILED"
                          ? "text-red-600"
                          : "text-gray-400"
                      }
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
