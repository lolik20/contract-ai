"use client";

import { useRef, useState } from "react";
import type { TemplateField } from "@prisma/client";
import { renderTemplate, formatValues } from "@/lib/template";

interface Props {
  contractId: string;
  initialContent: string;
  fields: TemplateField[];
}

// Sample values so the preview shows realistic text instead of {{placeholders}}.
function sampleValues(fields: TemplateField[]): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of fields) v[f.name] = f.label;
  return v;
}

export function TemplateBodyEditor({ contractId, initialContent, fields }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertPlaceholder = (name: string) => {
    const ta = taRef.current;
    const token = `{{${name}}}`;
    if (!ta) {
      setContent((c) => c + token);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + token + content.slice(end);
    setContent(next);
    // restore caret after the inserted token
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + token.length;
      ta.setSelectionRange(pos, pos);
    });
    setSaved(false);
  };

  const wrap = (before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || "текст";
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/contracts/${contractId}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      alert("Не удалось сохранить шаблон");
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = renderTemplate(content, formatValues(sampleValues(fields), fields));

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => wrap("<h3>", "</h3>")}
          className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
        >
          Заголовок
        </button>
        <button
          type="button"
          onClick={() => wrap("<p>", "</p>")}
          className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
        >
          Абзац
        </button>
        <button
          type="button"
          onClick={() => wrap("<strong>", "</strong>")}
          className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 font-bold"
        >
          Жирный
        </button>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showPreview ? "Скрыть превью" : "Показать превью"}
        </button>
      </div>

      {/* Field chips */}
      {fields.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1.5">
            Кликните, чтобы вставить поле в текст:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => insertPlaceholder(f.name)}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100"
                title={`{{${f.name}}}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
          }}
          spellCheck={false}
          className="w-full h-[320px] border border-gray-300 rounded-lg p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Введите текст договора. Используйте кнопки полей выше для вставки динамических значений."
        />

        {showPreview && (
          <div className="h-[600px] overflow-auto border border-gray-200 rounded-lg bg-gray-100 p-4">
            {/* True A4 sheet: 210×297mm with ~20mm document margins. */}
            <div
              className="bg-white shadow-md mx-auto prose prose-sm max-w-none"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "20mm",
                boxSizing: "border-box",
                fontFamily: "'Times New Roman', serif",
                fontSize: "11pt",
                lineHeight: 1.6,
                color: "#1a1a1a",
              }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Сохранение…" : "Сохранить шаблон"}
        </button>
        {saved && <span className="text-sm text-green-600">✓ Сохранено</span>}
      </div>
    </div>
  );
}
