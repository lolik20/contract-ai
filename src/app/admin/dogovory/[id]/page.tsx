import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FieldList } from "@/components/admin/FieldList";
import { ContractMetaEditor } from "@/components/admin/ContractMetaEditor";
import { TemplateBodyEditor } from "@/components/admin/TemplateBodyEditor";
import { SectionList } from "@/components/admin/SectionList";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditContractPage({ params }: Props) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          fields: { orderBy: { order: "asc" } },
          sections: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!contract) return notFound();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/dogovory" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Договоры
          </Link>
          <ContractMetaEditor
            id={id}
            name={contract.name}
            description={contract.description}
            slug={contract.slug}
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/admin/dogovory/${id}/seo`}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            SEO
          </Link>
          <Link href={`/dogovory/${contract.slug}`} target="_blank"
            className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
            Открыть ↗
          </Link>
        </div>
      </div>

      {/* ── Body: sidebar (fields+sections) + split editor ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar: fields & sections */}
        <div className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Поля договора</h2>
            <FieldList contractId={id} initialFields={contract.template?.fields ?? []} />
          </div>
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Разделы договора</h2>
            <p className="text-xs text-gray-400 mb-3">Выключаемые блоки текста.</p>
            <SectionList contractId={id} initialSections={contract.template?.sections ?? []} />
          </div>
        </div>

        {/* Split editor + preview */}
        <div className="flex-1 overflow-hidden">
          <TemplateBodyEditor
            contractId={id}
            initialContent={contract.template?.content ?? ""}
            fields={contract.template?.fields ?? []}
          />
        </div>

      </div>
    </div>
  );
}
