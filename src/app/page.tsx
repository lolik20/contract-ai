import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { SiteFooter } from "@/components/neuro/SiteFooter";
import { TariffCards } from "@/components/neuro/TariffCards";

export const revalidate = 3600;

const SELLING_POINTS = [
  "Ответ за ~30 секунд — без записи на приём и ожидания.",
  "От 33 ₽ за вопрос — дешевле очного юриста (обычно 1500–3000 ₽).",
  "Ссылки на статьи КоАП и УК РФ прямо в ответе.",
  "Опора на реальную судебную практику, а не только текст закона.",
  "Готовый договор за 5 минут: заполнил → скачал PDF.",
  "Первый вопрос — бесплатно, сразу после входа.",
];

export default async function HomePage() {
  const contracts = await prisma.contractType.findMany({
    where: { isPublished: true },
    include: { seo: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero + продающий блок про нейроюриста */}
        <section className="mx-auto max-w-5xl px-4 py-14 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Нейроюрист и шаблоны договоров онлайн
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Задайте вопрос нейроюристу по КоАП и Уголовному кодексу РФ — получите
            ответ со ссылками на статьи и судебную практику. И заполните нужный
            договор за пару минут.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/neuro"
              className="rounded-lg bg-blue-700 px-6 py-3 text-base font-medium text-white hover:bg-blue-800"
            >
              Задать вопрос бесплатно
            </Link>
            <Link
              href="#shablony"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Скачать договор
            </Link>
          </div>

          <ul className="mx-auto mt-8 grid max-w-3xl gap-2 text-left sm:grid-cols-2">
            {SELLING_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-blue-600">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Все шаблоны договоров */}
        <section id="shablony" className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Шаблоны договоров
            </h2>
            <p className="mt-1 text-gray-600">
              Заполните онлайн и скачайте готовый документ бесплатно.
            </p>
          </div>

          {contracts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              Договоры ещё не добавлены
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/dogovory/${contract.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                    {contract.name}
                  </h3>
                  {contract.description && (
                    <p className="text-sm text-gray-500">{contract.description}</p>
                  )}
                  <div className="mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-800">
                    Заполнить →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Тарифы нейроюриста */}
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Тарифы нейроюриста
            </h2>
            <p className="mt-1 text-gray-600">
              Первый вопрос бесплатно. Дальше — чем больше пакет, тем дешевле вопрос.
            </p>
          </div>
          <TariffCards />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
