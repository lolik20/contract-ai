"use client";

import Link from "next/link";
import { useState } from "react";
import { useMe } from "./useMe";
import { BalanceBadge } from "./BalanceBadge";

const NAV = [
  { href: "/neuro", label: "Нейроюрист" },
  { href: "/tarify", label: "Тарифы" },
  { href: "/#shablony", label: "Шаблоны" },
];

export function SiteHeader() {
  const { user, loading } = useMe();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur safe-x">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-blue-700">
          Договорились.ру
        </Link>

        {/* Десктоп-навигация */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <>
              <BalanceBadge balance={user.questionBalance} />
              <Link
                href="/kabinet"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                {user.name || "Кабинет"}
              </Link>
            </>
          ) : !loading ? (
            <Link
              href="/vhod"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Войти
            </Link>
          ) : null}
        </div>

        {/* Кнопка мобильного меню */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Меню"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Мобильное меню */}
      {open && (
        <nav className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-gray-200" />
            {!loading && user ? (
              <>
                <div className="px-2 py-1">
                  <BalanceBadge balance={user.questionBalance} />
                </div>
                <Link
                  href="/kabinet"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {user.name || "Личный кабинет"}
                </Link>
              </>
            ) : (
              <Link
                href="/vhod"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-blue-700 px-2 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800"
              >
                Войти
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
