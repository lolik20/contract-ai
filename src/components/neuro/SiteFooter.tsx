import Link from "next/link";

/** Общий футер: юридические ссылки + реквизиты владельца. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white safe-bottom safe-x">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-bold text-blue-700">Договорились.ру</div>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Шаблоны договоров и консультации нейроюриста онлайн.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <Link
              href="/politika-konfidencialnosti"
              className="text-gray-600 hover:text-gray-900"
            >
              Политика конфиденциальности
            </Link>
            <Link href="/oferta" className="text-gray-600 hover:text-gray-900">
              Публичная оферта
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
          ИП Федоткин Максим Сергеевич · ИНН 920358422008
        </div>
      </div>
    </footer>
  );
}
