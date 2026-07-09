import type { Metadata } from "next";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { SiteFooter } from "@/components/neuro/SiteFooter";
import { TariffCards } from "@/components/neuro/TariffCards";

export const metadata: Metadata = {
  title: "Тарифы нейроюриста",
  description:
    "Пакеты вопросов нейроюристу: 3 вопроса — 150 ₽, 10 — 400 ₽, 30 — 1000 ₽.",
};

export default function TariffPage() {
  return (
    <div className="flex min-h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Тарифы нейроюриста
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
          Оплата картой или через СБП. Вопросы не сгорают. Первый вопрос при
          регистрации — бесплатно.
        </p>
        <div className="mt-8">
          <TariffCards />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
