"use client";

import { useState } from "react";

interface Props {
  contractId: string;
  initialContent: string;
}

export function TemplateEditor({ contractId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Extract placeholders from content
  const placeholders = [...new Set(
    Array.from(content.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1])
  )];

  const insertPlaceholder = (name: string) => {
    setContent((prev) => prev + `{{${name}}}`);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/contracts/${contractId}/template`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {placeholders.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500 self-center">Плейсхолдеры:</span>
          {placeholders.map((p) => (
            <button
              key={p}
              onClick={() => insertPlaceholder(p)}
              className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-0.5 rounded hover:bg-yellow-100"
            >
              {`{{${p}}}`}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={24}
        className="w-full font-mono text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        placeholder="HTML шаблон договора с {{placeholders}}"
        spellCheck={false}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Сохранение..." : "Сохранить шаблон"}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Сохранено</span>}
      </div>
    </div>
  );
}
