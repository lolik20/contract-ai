"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMe } from "./useMe";

/**
 * Плавающая кнопка-чат в правом нижнем углу на всех страницах.
 * Клик открывает панель с кратким рассказом и CTA:
 *  - гость → вход;
 *  - авторизован → страница всех диалогов /neuro/chat.
 */
export function NeuroChatWidget() {
  const pathname = usePathname();
  const { user, loading } = useMe();
  const [open, setOpen] = useState(false);

  // В админке и в самом чате виджет не показываем.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/neuro/chat")) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end safe-bottom safe-x">
      {open && (
        <div className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="text-base font-semibold text-gray-900">
              Нейроюрист онлайн
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Закрыть"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Отвечу на вопрос со ссылками на КоАП и Уголовный кодекс РФ и реальную
            судебную практику. Первый вопрос — в подарок.
          </p>

          {loading ? (
            <div className="mt-4 h-10 rounded-lg bg-gray-100" />
          ) : user ? (
            <Link
              href="/neuro/chat"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800"
            >
              Открыть мои диалоги
            </Link>
          ) : (
            <Link
              href="/vhod"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800"
            >
              Войти и задать вопрос
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800"
        aria-label="Чат с нейроюристом"
        aria-expanded={open}
      >
        {open ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
