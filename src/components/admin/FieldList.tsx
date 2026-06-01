"use client";

import { useState } from "react";
import type { TemplateField } from "@prisma/client";
import { FieldEditor } from "./FieldEditor";

const TYPE_LABELS: Record<string, string> = {
  TEXT: "Текст",
  TEXTAREA: "Много текста",
  DATE: "Дата",
  NUMBER: "Число",
  SELECT: "Список",
  EMAIL: "Email",
  PHONE: "Телефон",
};

interface Props {
  contractId: string;
  initialFields: TemplateField[];
}

export function FieldList({ contractId, initialFields }: Props) {
  const [fields, setFields] = useState(
    [...initialFields].sort((a, b) => a.order - b.order)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const reload = async () => {
    const res = await fetch(`/api/contracts/${contractId}/fields`);
    const data: TemplateField[] = await res.json();
    setFields([...data].sort((a, b) => a.order - b.order));
  };

  const deleteField = async (id: string) => {
    if (!confirm("Удалить поле?")) return;
    await fetch(`/api/contracts/${contractId}/fields/${id}`, { method: "DELETE" });
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {fields.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Полей нет</p>
        )}
        {fields.map((field) => (
          <div key={field.id}>
            {editingId === field.id ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <FieldEditor
                  contractId={contractId}
                  field={field}
                  onSaved={async () => {
                    setEditingId(null);
                    await reload();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-right">{field.order}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{field.label}</span>
                    <span className="ml-2 font-mono text-xs text-gray-400">{`{{${field.name}}}`}</span>
                    {field.required && (
                      <span className="ml-1 text-red-400 text-xs">*</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {TYPE_LABELS[field.type]}
                  </span>
                  <button
                    onClick={() => setEditingId(field.id)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Новое поле</h4>
          <FieldEditor
            contractId={contractId}
            defaultOrder={fields.length + 1}
            onSaved={async () => {
              setShowAdd(false);
              await reload();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Добавить поле
        </button>
      )}
    </div>
  );
}
