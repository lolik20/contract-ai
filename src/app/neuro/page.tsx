import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { SiteFooter } from "@/components/neuro/SiteFooter";
import { TariffCards } from "@/components/neuro/TariffCards";

export const metadata: Metadata = {
  title: "Нейроюрист онлайн",
  description:
    "Ответ юриста за ~30 секунд со ссылками на КоАП и УК РФ и судебную практику. Первый вопрос бесплатно.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    t: "Опишите ситуацию",
    d: "Задайте вопрос своими словами — как обычному юристу.",
  },
  {
    n: "2",
    t: "Получите ответ со ссылками",
    d: "Нейроюрист приведёт статьи КоАП/УК РФ и судебную практику.",
  },
  {
    n: "3",
    t: "Действуйте увереннее",
    d: "Понимайте свои права и следующий шаг без похода к юристу.",
  },
];

export default async function NeuroLanding() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/neuro/chat" : "/vhod";

  return (
    <div className="flex min-h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Нейроюрист по КоАП и Уголовному кодексу РФ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Ответ за ~30 секунд со ссылками на статьи и реальную судебную практику.
            Дешевле очного юриста — от 33 ₽ за вопрос. Первый вопрос в подарок.
          </p>
          <div className="mt-6">
            <Link
              href={ctaHref}
              className="inline-block rounded-xl bg-blue-700 px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-200 hover:bg-blue-800"
            >
              Задать вопрос бесплатно
            </Link>
          </div>
        </section>

        {/* Как это работает */}
        <section className="mx-auto max-w-4xl px-4 pb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 shadow-sm">
                  {s.n}
                </div>
                <div className="mt-3 font-semibold text-gray-900">{s.t}</div>
                <div className="mt-1 text-sm text-gray-600">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Тарифы */}
        <section className="mx-auto max-w-4xl px-4 py-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">Тарифы</h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            Чем больше пакет — тем дешевле вопрос.
          </p>
          <div className="mt-6">
            <TariffCards />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
