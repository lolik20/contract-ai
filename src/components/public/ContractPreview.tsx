"use client";

import { renderTemplate } from "@/lib/template";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Signature {
  label: string;
  initials: string;
  dataUrl: string;
}

interface Props {
  templateHtml: string;
  values: Record<string, string>;
  sections?: Section[];
  enabledSectionIds?: Set<string>;
  signatures?: Signature[];
}

export function ContractPreview({ templateHtml, values, sections = [], enabledSectionIds, signatures = [] }: Props) {
  let html: string;

  if (sections.length > 0 && enabledSectionIds) {
    const sectionsHtmlStr = sections
      .filter((s) => enabledSectionIds.has(s.id))
      .map((s) => {
        const body = renderTemplate(s.content, values);
        return `<h3 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em">${s.title}</h3>${body}`;
      })
      .join("\n");
    html = renderTemplate(templateHtml, values) + "\n" + sectionsHtmlStr;
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
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />

        {signatures.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
            {signatures.map((s, i) => (
              <div key={i} style={{ width: "45%" }}>
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>{s.label}</div>
                {s.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- подпись в виде data-URL, next/image не нужен
                  <img
                    src={s.dataUrl}
                    alt=""
                    style={{ display: "block", width: "100%", height: 60, objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ height: 60 }} />
                )}
                <div style={{ borderTop: "1px solid #000", marginTop: 2, paddingTop: 3 }}>
                  {s.initials || "_______________________"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
