"use client";

import { renderTemplate } from "@/lib/template";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Props {
  templateHtml: string;
  values: Record<string, string>;
  sections?: Section[];
  enabledSectionIds?: Set<string>;
}

export function ContractPreview({ templateHtml, values, sections = [], enabledSectionIds }: Props) {
  let html: string;

  if (sections.length > 0 && enabledSectionIds) {
    // Render only enabled sections
    const parts = sections
      .filter((s) => enabledSectionIds.has(s.id))
      .map((s) => {
        const body = renderTemplate(s.content, values);
        return `<h3 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em">${s.title}</h3>${body}`;
      });
    html = parts.join("\n");
  } else {
    // Fallback: legacy monolithic template
    html = renderTemplate(templateHtml, values);
  }

  return (
    <div
      id="contract-preview"
      className="bg-white shadow-sm border border-gray-200 rounded-lg p-10 min-h-[297mm]"
      style={{ fontFamily: "'Times New Roman', serif" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
