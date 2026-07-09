"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dogovory", label: "Договоры" },
  { href: "/admin/statistika", label: "Статистика" },
  { href: "/admin/dialogi", label: "Диалоги" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-gray-900 text-white min-h-screen flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? "w-12" : "w-56"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center border-b border-gray-700 ${collapsed ? "px-2 py-4 justify-center" : "px-4 py-5 justify-between"}`}>
        {!collapsed && (
          <div>
            <Link href="/" className="text-sm font-bold text-blue-400 hover:text-blue-300">
              ← Сайт
            </Link>
            <div className="text-xs text-gray-400 mt-1">Администрация</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        >
          {collapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
          >
            {/* Folder icon */}
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
