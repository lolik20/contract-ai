import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { Chat } from "@/components/neuro/Chat";

export const metadata: Metadata = { title: "Диалоги с нейроюристом" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ c?: string; welcome?: string }>;
}

export default async function ChatPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/vhod");

  const { c, welcome } = await searchParams;

  const consultations = await prisma.consultation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  // Проверяем, что активный диалог принадлежит пользователю.
  const activeId =
    c && consultations.some((x) => x.id === c) ? c : null;

  return (
    <div className="flex h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />
      <Chat
        initialConsultations={consultations}
        initialBalance={user.questionBalance}
        initialActiveId={activeId}
        welcome={welcome === "1"}
      />
    </div>
  );
}
