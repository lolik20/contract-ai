import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session_token";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 дней

/** Создать сессию для пользователя и записать httpOnly-cookie. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { userId, token, expiresAt } });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Текущий пользователь по сессионной cookie (или null). */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
    return null;
  }
  return session.user;
}

/** Пользователь-админ или null. */
export async function getCurrentAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return user && user.role === "ADMIN" ? user : null;
}

/** Завершить текущую сессию (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  store.delete(COOKIE_NAME);
}

/**
 * Апсерт пользователя по Яндекс-профилю (или dev-входу).
 * questionBalance = 1 задаётся дефолтом схемы — подарок при регистрации.
 */
export async function upsertUser(params: {
  yandexId?: string;
  email?: string;
  name?: string | null;
  avatarUrl?: string | null;
}): Promise<{ user: User; isNew: boolean }> {
  const { yandexId, email, name, avatarUrl } = params;

  let existing: User | null = null;
  if (yandexId) {
    existing = await prisma.user.findUnique({ where: { yandexId } });
  }
  if (!existing && email) {
    existing = await prisma.user.findUnique({ where: { email } });
  }

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        yandexId: yandexId ?? existing.yandexId,
        email: email ?? existing.email,
        name: name ?? existing.name,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
      },
    });
    return { user, isNew: false };
  }

  const user = await prisma.user.create({
    data: { yandexId, email, name, avatarUrl },
  });
  return { user, isNew: true };
}
