"use client";

import { useState } from "react";
import type { TemplateField, ContractSection, SectionField } from "@prisma/client";
import { ContractFillForm } from "./ContractFillForm";
import { ContractPreview } from "./ContractPreview";
import { formatValues } from "@/lib/template";

type SectionWithFields = ContractSection & { fields: SectionField[] };

interface Props {
  contractId: string;
  templateHtml: string;
  fields: TemplateField[];
  sections: SectionWithFields[];
  introText?: string | null;
}

export function ContractPageLayout({ contractId, templateHtml, fields, sections, introText }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [downloading, setDownloading] = useState(false);

  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.defaultEnabled]))
  );

  const toggleSection = (id: string) =>
    setEnabledSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const enabledIds = sections.filter((s) => enabledSections[s.id]).map((s) => s.id);

  // All fields (template + enabled section fields) for formatting
  const allFields: TemplateField[] = [
    ...fields,
    ...sections
      .filter((s) => enabledSections[s.id])
      .flatMap((s) => s.fields as unknown as TemplateField[]),
  ];

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: formatValues(values, allFields),
          enabledSectionIds: enabledIds,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dogovor.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при генерации PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {introText && (
        <p className="no-print text-gray-600 mb-6 text-sm bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          {introText}
        </p>
      )}

      <div className="no-print flex border border-gray-200 rounded-lg overflow-hidden mb-4 md:hidden">
        <button className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === "form" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
          onClick={() => setActiveTab("form")}>Заполнить</button>
        <button className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === "preview" ? "bg-blue-600 text-white" : "bg-white text-gray-600"}`}
          onClick={() => setActiveTab("preview")}>Просмотр</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form column */}
        <div className={`no-print md:block ${activeTab === "form" ? "block" : "hidden"}`}>
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:sticky md:top-6 space-y-6">

            {/* Main template fields */}
            {fields.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-800 mb-4">Заполните данные</h2>
                <ContractFillForm fields={fields} values={values} onChange={handleChange} />
              </div>
            )}

            {/* Section toggles + section-specific fields */}
            {sections.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-800">Разделы договора</h2>
                {sections.map((s) => (
                  <div key={s.id}>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabledSections[s.id]}
                        onClick={() => toggleSection(s.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${
                          enabledSections[s.id] ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
                          enabledSections[s.id] ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </button>
                      <span className={`text-sm font-medium ${enabledSections[s.id] ? "text-gray-800" : "text-gray-400 line-through"}`}>
                        {s.title}
                      </span>
                    </label>
                    {enabledSections[s.id] && s.fields.length > 0 && (
                      <div className="pl-12">
                        <ContractFillForm
                          fields={s.fields as unknown as TemplateField[]}
                          values={values}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Генерация PDF…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Скачать PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview column */}
        <div className={`md:block ${activeTab === "preview" ? "block" : "hidden"}`}>
          <ContractPreview
            templateHtml={templateHtml}
            values={formatValues(values, allFields)}
            sections={sections}
            enabledSectionIds={new Set(enabledIds)}
          />
        </div>
      </div>
    </div>
  );
}
