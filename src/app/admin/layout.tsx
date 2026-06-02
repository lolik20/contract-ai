import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Админка | Договорились.ру" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
