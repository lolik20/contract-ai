import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NeuroChatWidget } from "@/components/neuro/NeuroChatWidget";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen`}>
        {children}
        <NeuroChatWidget />
      </body>
    </html>
  );
}
