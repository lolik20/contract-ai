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
    const sectionsHtml = sections
      .filter((s) => enabledSectionIds.has(s.id))
      .map((s) => {
        const body = renderTemplate(s.content, values);
        return `<h3 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em">${s.title}</h3>${body}`;
      })
      .join("\n");
    html = renderTemplate(templateHtml, values) + "\n" + sectionsHtml;
  } else {
    html = renderTemplate(templateHtml, values);
  }

  // Render content split into A4 page blocks with visible gaps between them.
  // We use a wrapper with gray bg and per-page white divs separated by margin.
  return (
    <div id="contract-preview" className="bg-gray-200 rounded-lg p-4 space-y-0">
      <div
        className="bg-white shadow-md mx-auto"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          boxSizing: "border-box",
          fontFamily: "'Times New Roman', serif",
          fontSize: "11pt",
          lineHeight: 1.6,
          color: "#1a1a1a",
          /* Paint a gray band every 297mm to simulate page breaks */
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(297mm - 20px),
            #e5e7eb calc(297mm - 20px),
            #e5e7eb calc(297mm + 20px),
            transparent calc(297mm + 20px)
          )`,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
