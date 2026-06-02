import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
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
    include: {
      template: {
        include: { sections: { orderBy: { order: "asc" }, include: { fields: { orderBy: { order: "asc" } } } } },
      },
    },
  });

  if (!contract?.template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const body: { values?: Record<string, string>; enabledSectionIds?: string[] } = await req.json();
  const values: Record<string, string> = body.values ?? (body as Record<string, string>);
  const enabledSectionIds = body.enabledSectionIds ? new Set(body.enabledSectionIds) : null;

  const baseHtml = renderTemplate(contract.template.content, values);

  let htmlContent: string;
  if (enabledSectionIds && contract.template.sections.length > 0) {
    const sectionsHtml = contract.template.sections
      .filter((s) => enabledSectionIds.has(s.id))
      .map((s) => `<h3>${s.title}</h3>${renderTemplate(s.content, values)}`)
      .join("\n");
    htmlContent = baseHtml + "\n" + sectionsHtml;
  } else {
    htmlContent = baseHtml;
  }

  const stream = await renderToStream(
    createElement(ContractPdfDocument, { title: contract.name, htmlContent })
  );

  const chunks: Buffer[] = [];
  const buffer: Buffer = await new Promise((resolve, reject) => {
    stream.on("data", (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(contract.slug)}.pdf"`,
    },
  });
}
