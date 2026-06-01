import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/template";
import { ContractPdfDocument } from "@/lib/pdf";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;

  const contract = await prisma.contractType.findUnique({
    where: { id },
    include: { template: true },
  });

  if (!contract?.template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const values: Record<string, string> = await req.json();
  const htmlContent = renderTemplate(contract.template.content, values);

  const pdfString = await pdf(
    createElement(ContractPdfDocument, { title: contract.name, htmlContent })
  ).toString();

  const buffer = Buffer.from(pdfString, "binary");

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(contract.slug)}.pdf"`,
    },
  });
}
