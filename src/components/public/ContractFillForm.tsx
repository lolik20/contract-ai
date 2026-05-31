"use client";

import type { TemplateField } from "@prisma/client";

interface Props {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function ContractFillForm({ fields, values, onChange }: Props) {
  const sorted = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sorted.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "TEXTAREA" ? (
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={field.placeholder ?? ""}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          ) : field.type === "SELECT" ? (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">— Выберите —</option>
              {field.options
                ? (JSON.parse(field.options) as string[]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))
                : null}
            </select>
          ) : (
            <input
              type={
                field.type === "DATE"
                  ? "date"
                  : field.type === "NUMBER"
                  ? "number"
                  : field.type === "EMAIL"
                  ? "email"
                  : field.type === "PHONE"
                  ? "tel"
                  : "text"
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder ?? ""}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
