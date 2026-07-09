import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Список консультаций текущего пользователя.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const consultations = await prisma.consultation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ consultations });
}

// Создать новую (пустую) консультацию.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const consultation = await prisma.consultation.create({
    data: { userId: user.id },
    select: { id: true, title: true, updatedAt: true },
  });
  return NextResponse.json({ consultation }, { status: 201 });
}
