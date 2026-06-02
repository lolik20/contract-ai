import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createElement } from "react";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/template";
import { ContractPdfDocument, type SignatureData } from "@/lib/pdf";

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

  const body: {
    values?: Record<string, string>;
    enabledSectionIds?: string[];
    signatures?: Partial<SignatureData>[];
  } = await req.json();
  const values: Record<string, string> = body.values ?? (body as Record<string, string>);
  const enabledSectionIds = body.enabledSectionIds ? new Set(body.enabledSectionIds) : null;

  const signatures: SignatureData[] = Array.isArray(body.signatures)
    ? body.signatures
        .map((s) => ({
          label: typeof s?.label === "string" ? s.label : "",
          initials: typeof s?.initials === "string" ? s.initials : "",
          dataUrl:
            typeof s?.dataUrl === "string" && s.dataUrl.startsWith("data:image/")
              ? s.dataUrl
              : "",
        }))
        .filter((s) => s.dataUrl || s.initials)
    : [];

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
    createElement(ContractPdfDocument, { title: contract.name, htmlContent, signatures })
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
