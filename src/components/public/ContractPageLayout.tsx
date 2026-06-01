"use client";

import { useState } from "react";
import type { TemplateField } from "@prisma/client";
import { ContractFillForm } from "./ContractFillForm";
import { ContractPreview } from "./ContractPreview";
import { formatValues } from "@/lib/template";

interface Props {
  contractId: string;
  templateHtml: string;
  fields: TemplateField[];
  introText?: string | null;
}

export function ContractPageLayout({ contractId, templateHtml, fields, introText }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [downloading, setDownloading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatValues(values, fields)),
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

      {/* Mobile tab toggle */}
      <div className="no-print flex border border-gray-200 rounded-lg overflow-hidden mb-4 md:hidden">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "form" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Заполнить
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Просмотр
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form column */}
        <div className={`no-print md:block ${activeTab === "form" ? "block" : "hidden"}`}>
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:sticky md:top-6">
            <h2 className="font-semibold text-gray-800 mb-4">Заполните данные</h2>
            <ContractFillForm fields={fields} values={values} onChange={handleChange} />

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Генерация PDF...
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
          <ContractPreview templateHtml={templateHtml} values={formatValues(values, fields)} />
        </div>
      </div>
    </div>
  );
}
