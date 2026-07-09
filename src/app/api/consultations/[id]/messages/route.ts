import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  streamNeurolawyerAnswer,
  isNeurolawyerConfigured,
  type ChatTurn,
} from "@/lib/neurolawyer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Schema = z.object({ content: z.string().min(1).max(4000) });

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const consultation = await prisma.consultation.findUnique({ where: { id } });
  if (!consultation || consultation.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const content = parsed.data.content.trim();

  if (!isNeurolawyerConfigured()) {
    return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  }

  // Списываем 1 вопрос атомарно (защита от гонки и от отрицательного баланса).
  const charged = await prisma.user.updateMany({
    where: { id: user.id, questionBalance: { gt: 0 } },
    data: { questionBalance: { decrement: 1 } },
  });
  if (charged.count === 0) {
    return NextResponse.json({ error: "no_balance" }, { status: 409 });
  }

  // Сохраняем вопрос пользователя и, при необходимости, задаём заголовок треда.
  await prisma.message.create({
    data: { consultationId: id, role: "USER", content },
  });
  if (!consultation.title) {
    await prisma.consultation.update({
      where: { id },
      data: { title: content.slice(0, 60) },
    });
  }

  // История для модели.
  const dbMessages = await prisma.message.findMany({
    where: { consultationId: id },
    orderBy: { createdAt: "asc" },
  });
  const history: ChatTurn[] = dbMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  // Пытаемся получить стрим; при ошибке — возвращаем вопрос обратно на баланс.
  let completion;
  try {
    completion = await streamNeurolawyerAnswer(history);
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { questionBalance: { increment: 1 } },
    });
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  let full = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            full += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch {
        const msg = "\n\n[Не удалось получить полный ответ. Попробуйте ещё раз.]";
        full += msg;
        controller.enqueue(encoder.encode(msg));
      } finally {
        await prisma.message.create({
          data: {
            consultationId: id,
            role: "ASSISTANT",
            content: full || "(пустой ответ)",
          },
        });
        await prisma.consultation.update({
          where: { id },
          data: { updatedAt: new Date() },
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
