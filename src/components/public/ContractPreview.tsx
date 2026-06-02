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

  return (
    <div id="contract-preview" className="w-full overflow-x-auto">
      <div
        style={{
          width: "210mm",
          minWidth: "210mm",
          padding: "20mm",
          boxSizing: "border-box",
          fontFamily: "'Times New Roman', serif",
          fontSize: "11pt",
          lineHeight: 1.6,
          color: "#1a1a1a",
          background: "#fff",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
