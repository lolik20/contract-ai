"use client";

import { renderTemplate } from "@/lib/template";

interface Props {
  templateHtml: string;
  values: Record<string, string>;
}

export function ContractPreview({ templateHtml, values }: Props) {
  const rendered = renderTemplate(templateHtml, values);

  return (
    <div
      id="contract-preview"
      className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 min-h-[297mm]"
      style={{ fontFamily: "'Times New Roman', serif" }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
