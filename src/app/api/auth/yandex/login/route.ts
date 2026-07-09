import { NextResponse } from "next/server";

// Редирект на форму Яндекс ID. Активируется, когда заданы YANDEX_CLIENT_ID.
export async function GET() {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!clientId) {
    // Ключи ещё не подключены — вернуть пользователя на страницу входа.
    return NextResponse.redirect(`${base}/vhod?error=yandex_not_configured`);
  }

  const redirectUri = `${base}/api/auth/yandex/callback`;
  const url = new URL("https://oauth.yandex.ru/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(url.toString());
}
