import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/neuro/SiteHeader";
import { SiteFooter } from "@/components/neuro/SiteFooter";
import { LoginForm } from "@/components/neuro/LoginForm";

export const metadata: Metadata = {
  title: "Вход",
  description: "Войдите через Яндекс ID и получите 1 бесплатный вопрос нейроюристу.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/neuro/chat");

  return (
    <div className="flex min-h-dvh-safe flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <LoginForm />
      </main>
      <SiteFooter />
    </div>
  );
}
