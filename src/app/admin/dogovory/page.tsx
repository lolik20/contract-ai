import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublishToggle } from "@/components/admin/PublishToggle";

export const dynamic = "force-dynamic";

export default async function AdminContractsPage() {
  const contracts = await prisma.contractType.findMany({
    include: { seo: true, template: { include: { _count: { select: { fields: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Договоры</h1>
        <Link
          href="/admin/dogovory/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Создать договор
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Договоры не созданы
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Название</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Полей</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Публикация</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{contract.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{contract.slug}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {contract.template?._count.fields ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <PublishToggle id={contract.id} isPublished={contract.isPublished} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/dogovory/${contract.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      Просмотр ↗
                    </Link>
                    <Link
                      href={`/admin/dogovory/${contract.id}/seo`}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      SEO
                    </Link>
                    <Link
                      href={`/admin/dogovory/${contract.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Редактировать
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
