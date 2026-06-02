"use client";

import { useState } from "react";
import type { ContractSection } from "@prisma/client";
import { SectionEditor } from "./SectionEditor";

interface Props {
  contractId: string;
  initialSections: ContractSection[];
}

export function SectionList({ contractId, initialSections }: Props) {
  const [sections, setSections] = useState(
    [...initialSections].sort((a, b) => a.order - b.order)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const reload = async () => {
    const res = await fetch(`/api/contracts/${contractId}/sections`);
    const data: ContractSection[] = await res.json();
    setSections([...data].sort((a, b) => a.order - b.order));
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Удалить раздел?")) return;
    await fetch(`/api/contracts/${contractId}/sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {sections.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Разделов нет</p>
        )}
        {sections.map((section) => (
          <div key={section.id}>
            {editingId === section.id ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <SectionEditor
                  contractId={contractId}
                  section={section}
                  onSaved={async () => { setEditingId(null); await reload(); }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-white hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-400 w-5 text-right shrink-0">{section.order}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900">{section.title}</span>
                    {!section.defaultEnabled && (
                      <span className="ml-2 text-xs text-gray-400">(откл. по умолч.)</span>
                    )}
                    {section.content && (
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                        {section.content.replace(/<[^>]+>/g, "").slice(0, 80)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded ${section.defaultEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {section.defaultEnabled ? "вкл." : "выкл."}
                  </span>
                  <button onClick={() => setEditingId(section.id)} className="text-xs text-blue-500 hover:text-blue-700">
                    Изменить
                  </button>
                  <button onClick={() => deleteSection(section.id)} className="text-xs text-red-400 hover:text-red-600">
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
          <h4 className="text-sm font-medium text-gray-700 mb-3">Новый раздел</h4>
          <SectionEditor
            contractId={contractId}
            defaultOrder={sections.length + 1}
            onSaved={async () => { setShowAdd(false); await reload(); }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Добавить раздел
        </button>
      )}
    </div>
  );
}
