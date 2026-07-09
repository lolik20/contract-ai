import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const [types, totals, authed] = await Promise.all([
    prisma.contractType.findMany({ select: { id: true, name: true } }),
    prisma.templateDownload.groupBy({
      by: ["contractTypeId"],
      _count: { _all: true },
    }),
    prisma.templateDownload.groupBy({
      by: ["contractTypeId"],
      where: { userId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const totalMap = new Map(totals.map((t) => [t.contractTypeId, t._count._all]));
  const authMap = new Map(authed.map((t) => [t.contractTypeId, t._count._all]));

  const rows = types
    .map((t) => {
      const total = totalMap.get(t.id) ?? 0;
      const auth = authMap.get(t.id) ?? 0;
      return { id: t.id, name: t.name, total, auth, guests: total - auth };
    })
    .sort((a, b) => b.total - a.total);

  const sum = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      auth: acc.auth + r.auth,
      guests: acc.guests + r.guests,
    }),
    { total: 0, auth: 0, guests: 0 }
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Статистика скачиваний</h1>
      <p className="mt-1 text-sm text-gray-500">
        Скачивания шаблонов договоров: всего, авторизованными и гостями.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Всего скачиваний" value={sum.total} />
        <StatCard label="Авторизованные" value={sum.auth} />
        <StatCard label="Гости" value={sum.guests} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Шаблон</th>
              <th className="px-4 py-3 text-right font-medium">Всего</th>
              <th className="px-4 py-3 text-right font-medium">Авторизованные</th>
              <th className="px-4 py-3 text-right font-medium">Гости</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-gray-800">{r.name}</td>
                <td className="px-4 py-3 text-right font-medium">{r.total}</td>
                <td className="px-4 py-3 text-right text-gray-600">{r.auth}</td>
                <td className="px-4 py-3 text-right text-gray-600">{r.guests}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Пока нет данных.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
