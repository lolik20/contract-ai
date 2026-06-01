import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://dogovorilos.ru"
  ),
  title: {
    default: "Договорились.ру — шаблоны договоров онлайн",
    template: "%s | Договорились.ру",
  },
  description:
    "Заполните договор онлайн и скачайте готовый документ бесплатно. Юридически корректные шаблоны договоров для физических лиц.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen`}>{children}</body>
    </html>
  );
}
