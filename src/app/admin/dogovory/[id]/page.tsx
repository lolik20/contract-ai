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
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/dogovory" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Все договоры
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4">
        <ContractMetaEditor
          id={id}
          name={contract.name}
          description={contract.description}
          slug={contract.slug}
        />
        <div className="flex shrink-0 gap-2 pt-1">
          <Link
            href={`/admin/dogovory/${id}/seo`}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            SEO
          </Link>
          <Link
            href={`/dogovory/${contract.slug}`}
            target="_blank"
            className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
          >
            Открыть ↗
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Поля договора</h2>
        <FieldList
          contractId={id}
          initialFields={contract.template?.fields ?? []}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Разделы договора</h2>
        <p className="text-sm text-gray-500 mb-4">
          Разделы — это выключаемые блоки текста. Пользователь может включить или отключить каждый раздел на странице договора.
        </p>
        <SectionList
          contractId={id}
          initialSections={contract.template?.sections ?? []}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Текст договора</h2>
        <p className="text-sm text-gray-500 mb-4">
          Редактируйте текст договора и вставляйте поля. Превью обновляется на лету.
        </p>
        <TemplateBodyEditor
          contractId={id}
          initialContent={contract.template?.content ?? ""}
          fields={contract.template?.fields ?? []}
        />
      </div>
    </div>
  );
}
