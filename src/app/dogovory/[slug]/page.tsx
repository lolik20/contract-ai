import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ContractPageLayout } from "@/components/public/ContractPageLayout";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const contracts = await prisma.contractType.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return contracts.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { slug },
    include: { seo: true },
  });
  if (!contract) return {};

  const seo = contract.seo;
  return {
    title: seo?.pageTitle ?? contract.name,
    description: seo?.metaDescription ?? contract.description ?? undefined,
    keywords: seo?.keywords ?? undefined,
    openGraph: {
      title: seo?.ogTitle ?? seo?.pageTitle ?? contract.name,
      description: seo?.ogDescription ?? seo?.metaDescription ?? undefined,
      type: "website",
    },
  };
}

export default async function ContractPage({ params }: Props) {
  const { slug } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { slug, isPublished: true },
    include: {
      seo: true,
      template: { include: { fields: true } },
    },
  });

  if (!contract || !contract.template) return notFound();

  const { seo, template } = contract;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-blue-700 font-bold text-lg">
            Договорились.ру
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 text-sm">{contract.name}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 no-print">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {seo?.h1 ?? contract.name}
          </h1>
        </div>

        <ContractPageLayout
          templateHtml={template.content}
          fields={template.fields}
          introText={seo?.introText}
        />
      </main>
    </div>
  );
}
