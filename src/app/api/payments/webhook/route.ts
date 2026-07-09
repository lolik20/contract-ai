import { prisma } from "@/lib/prisma";
import { verifyWebhook, type WebhookPayload } from "@/lib/payments/tbank";

export const dynamic = "force-dynamic";

// Нотификация Т-Кассы о статусе платежа. В ответ ожидается текст "OK".
export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as WebhookPayload | null;
  if (!payload) return new Response("ERROR", { status: 400 });

  if (!verifyWebhook(payload)) {
    return new Response("ERROR", { status: 400 });
  }

  // Начисляем вопросы только при успешном подтверждении оплаты.
  if (payload.Status === "CONFIRMED" && payload.Success) {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: String(payload.OrderId) },
      });
      // Идемпотентность: не начисляем повторно.
      if (!purchase || purchase.status === "SUCCEEDED") return;

      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "SUCCEEDED",
          providerPaymentId: String(payload.PaymentId),
        },
      });
      await tx.user.update({
        where: { id: purchase.userId },
        data: { questionBalance: { increment: purchase.questions } },
      });
    });
  } else if (
    payload.Status === "REJECTED" ||
    payload.Status === "CANCELED" ||
    payload.Success === false
  ) {
    await prisma.purchase
      .updateMany({
        where: { id: String(payload.OrderId), status: "PENDING" },
        data: { status: "FAILED" },
      })
      .catch(() => {});
  }

  return new Response("OK");
}
