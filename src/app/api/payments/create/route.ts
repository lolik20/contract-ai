import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTariff } from "@/lib/tariffs";
import { initPayment, isPaymentsConfigured } from "@/lib/payments/tbank";

export const dynamic = "force-dynamic";

const Schema = z.object({ plan: z.enum(["Q3", "Q10", "Q30"]) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const tariff = getTariff(parsed.data.plan);
  if (!tariff) return NextResponse.json({ error: "bad_plan" }, { status: 400 });

  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { error: "payments_not_configured" },
      { status: 503 }
    );
  }

  // Создаём покупку в статусе PENDING.
  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      plan: tariff.plan,
      questions: tariff.questions,
      amountKopecks: tariff.amountKopecks,
      status: "PENDING",
    },
  });

  const result = await initPayment({
    orderId: purchase.id,
    amountKopecks: tariff.amountKopecks,
    description: `Нейроюрист: ${tariff.title}`,
  });

  if (!result.success || !result.paymentUrl) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ error: "init_failed" }, { status: 502 });
  }

  if (result.paymentId) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { providerPaymentId: result.paymentId },
    });
  }

  return NextResponse.json({ paymentUrl: result.paymentUrl });
}
