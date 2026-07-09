import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, upsertUser } from "@/lib/auth";

// Стаб-вход для разработки (без Яндекс ID). Отключён в продакшене.
const Schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { user, isNew } = await upsertUser({
    email: parsed.data.email,
    name: parsed.data.name ?? parsed.data.email.split("@")[0],
  });
  await createSession(user.id);

  return NextResponse.json({ ok: true, isNew, balance: user.questionBalance });
}
