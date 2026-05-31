import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function HomePage() {
  const contracts = await prisma.contractType.findMany({
    where: { isPublished: true },
    include: { seo: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700">
            Договорились.ру
          </Link>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Админка
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Шаблоны договоров онлайн
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Заполните договор за несколько минут и скачайте готовый документ
            бесплатно
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Договоры ещё не добавлены
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/dogovory/${contract.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {contract.name}
                </h2>
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
      </main>

      <footer className="border-t border-gray-200 mt-auto py-8 text-center text-sm text-gray-400">
        © 2024 Договорились.ру — бесплатные шаблоны договоров
      </footer>
    </div>
  );
}
