"use client";

import { useState } from "react";
import type { TemplateField } from "@prisma/client";
import { ContractFillForm } from "./ContractFillForm";
import { ContractPreview } from "./ContractPreview";

interface Props {
  templateHtml: string;
  fields: TemplateField[];
  introText?: string | null;
}

export function ContractPageLayout({ templateHtml, fields, introText }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {introText && (
        <p className="text-gray-600 mb-6 text-sm bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
          {introText}
        </p>
      )}

      {/* Mobile tab toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4 md:hidden">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "form"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveTab("form")}
        >
          Заполнить
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Просмотр
        </button>
      </div>

      {/* Desktop: 2 columns; Mobile: tabs */}
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Form column */}
        <div
          className={`md:block ${activeTab === "form" ? "block" : "hidden"}`}
        >
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:sticky md:top-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Заполните данные
            </h2>
            <ContractFillForm
              fields={fields}
              values={values}
              onChange={handleChange}
            />
            <button
              onClick={handlePrint}
              className="no-print mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Скачать / Распечатать
            </button>
          </div>
        </div>

        {/* Preview column */}
        <div
          className={`md:block ${activeTab === "preview" ? "block" : "hidden"}`}
        >
          <ContractPreview templateHtml={templateHtml} values={values} />
        </div>
      </div>
    </div>
  );
}
