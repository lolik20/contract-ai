import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SeoForm } from "@/components/admin/SeoForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SeoPage({ params }: Props) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    include: { seo: true },
  });

  if (!contract) return notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/admin/dogovory/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← {contract.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">SEO настройки</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SeoForm contractId={id} seo={contract.seo} />
      </div>
    </div>
  );
}
