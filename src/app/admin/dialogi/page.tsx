import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDialogsPage() {
  const consultations = await prisma.consultation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Диалоги пользователей</h1>
      <p className="mt-1 text-sm text-gray-500">
        Просмотр консультаций нейроюриста под ролью администратора.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Тема</th>
              <th className="px-4 py-3 font-medium">Пользователь</th>
              <th className="px-4 py-3 text-right font-medium">Сообщений</th>
              <th className="px-4 py-3 text-right font-medium">Обновлён</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {consultations.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/dialogi/${c.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    {c.title || "Без названия"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.user.name || c.user.email || "—"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {c._count.messages}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">
                  {c.updatedAt.toLocaleString("ru-RU")}
                </td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Диалогов пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
