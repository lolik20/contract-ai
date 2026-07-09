import { NextResponse } from "next/server";
import { createSession, upsertUser } from "@/lib/auth";

// Обмен кода Яндекс ID на токен, получение профиля, создание сессии.
export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const clientId = process.env.YANDEX_CLIENT_ID;
  const clientSecret = process.env.YANDEX_CLIENT_SECRET;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${base}/vhod?error=yandex_not_configured`);
  }
  if (!code) {
    return NextResponse.redirect(`${base}/vhod?error=no_code`);
  }

  // 1. Код → токен
  const tokenRes = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base}/vhod?error=token`);
  }
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) {
    return NextResponse.redirect(`${base}/vhod?error=token`);
  }

  // 2. Токен → профиль
  const infoRes = await fetch("https://login.yandex.ru/info?format=json", {
    headers: { Authorization: `OAuth ${token.access_token}` },
  });
  if (!infoRes.ok) {
    return NextResponse.redirect(`${base}/vhod?error=profile`);
  }
  const info = (await infoRes.json()) as {
    id: string;
    default_email?: string;
    real_name?: string;
    display_name?: string;
    default_avatar_id?: string;
  };

  // 3. Апсерт пользователя + сессия
  const { user, isNew } = await upsertUser({
    yandexId: info.id,
    email: info.default_email,
    name: info.display_name || info.real_name || null,
    avatarUrl: info.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${info.default_avatar_id}/islands-200`
      : null,
  });
  await createSession(user.id);

  return NextResponse.redirect(`${base}/neuro/chat${isNew ? "?welcome=1" : ""}`);
}
