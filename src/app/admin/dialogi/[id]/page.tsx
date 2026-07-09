import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminDialogPage({ params }: Props) {
  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!consultation) notFound();

  return (
    <div className="p-6">
      <Link href="/admin/dialogi" className="text-sm text-blue-700 hover:underline">
        ← К списку диалогов
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">
        {consultation.title || "Без названия"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Пользователь: {consultation.user.name || consultation.user.email || "—"} ·
        режим просмотра (read-only)
      </p>

      <div className="mt-6 max-w-2xl space-y-4">
        {consultation.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "USER"
                  ? "bg-blue-700 text-white"
                  : "border border-gray-200 bg-white text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {consultation.messages.length === 0 && (
          <p className="text-sm text-gray-400">В диалоге пока нет сообщений.</p>
        )}
      </div>
    </div>
  );
}
