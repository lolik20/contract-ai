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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function signaturesHtml(signatures: Signature[]): string {
  if (signatures.length === 0) return "";
  const blocks = signatures
    .map((s) => {
      const img = s.dataUrl
        ? `<img src="${s.dataUrl}" alt="" style="display:block;width:100%;height:60px;object-fit:contain" />`
        : `<div style="height:60px"></div>`;
      const initials = s.initials ? escapeHtml(s.initials) : "_______________________";
      return `<div style="width:45%">
        <div style="font-weight:bold;margin-bottom:6px">${escapeHtml(s.label)}</div>
        ${img}
        <div style="border-top:1px solid #000;margin-top:2px;padding-top:3px">${initials}</div>
      </div>`;
    })
    .join("");
  return `<div style="display:flex;justify-content:space-between;margin-top:40px">${blocks}</div>`;
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

  html += signaturesHtml(signatures);

  return (
    <div
      id="contract-preview"
      className="shadow-sm border border-gray-200 rounded-lg"
      style={{
        fontFamily: "'Times New Roman', serif",
        fontSize: "11pt",
        lineHeight: 1.6,
        color: "#1a1a1a",
        padding: "20mm",
        boxSizing: "border-box",
        minHeight: "297mm",
        background: `
          repeating-linear-gradient(
            to bottom,
            #fff 0,
            #fff calc(297mm - 1px),
            #d1d5db calc(297mm - 1px),
            #d1d5db 297mm
          )
        `,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
