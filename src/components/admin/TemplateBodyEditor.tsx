"use client";

import { useRef, useState } from "react";
import type { TemplateField } from "@prisma/client";
import { renderTemplate, formatValues } from "@/lib/template";

interface Props {
  contractId: string;
  initialContent: string;
  fields: TemplateField[];
}

function sampleValues(fields: TemplateField[]): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of fields) v[f.name] = f.label;
  return v;
}

export function TemplateBodyEditor({ contractId, initialContent, fields }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertPlaceholder = (name: string) => {
    const ta = taRef.current;
    const token = `{{${name}}}`;
    if (!ta) { setContent((c) => c + token); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setContent(content.slice(0, start) + token + content.slice(end));
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
    setContent(content.slice(0, start) + before + selected + after + content.slice(end));
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
    /* Full-width split: left = editor, right = A4 preview */
    <div className="flex h-full min-h-[400px]">

      {/* ── LEFT: editor panel ── */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button type="button" onClick={() => wrap("<h3>", "</h3>")}
            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-white">Заголовок</button>
          <button type="button" onClick={() => wrap("<p>", "</p>")}
            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-white">Абзац</button>
          <button type="button" onClick={() => wrap("<strong>", "</strong>")}
            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-white font-bold">Жирный</button>
          <button type="button" onClick={() => wrap("<ul><li>", "</li></ul>")}
            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-white">Список</button>

          <span className="flex-1" />

          <button type="button" onClick={save} disabled={saving}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
          {saved && <span className="text-xs text-green-600">✓</span>}
        </div>

        {/* Field chips */}
        {fields.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 mb-1.5">Вставить поле:</p>
            <div className="flex flex-wrap gap-1">
              {fields.map((f) => (
                <button key={f.id} type="button" onClick={() => insertPlaceholder(f.name)}
                  title={`{{${f.name}}}`}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100">
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); setSaved(false); }}
          spellCheck={false}
          className="flex-1 w-full p-4 font-mono text-xs leading-relaxed resize-none focus:outline-none"
          placeholder="Введите HTML-текст договора. Используйте кнопки выше для вставки полей и форматирования."
        />
      </div>

      {/* ── RIGHT: A4 preview ── */}
      <div className="flex flex-col w-1/2 bg-gray-100">
        <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500 font-medium">Предпросмотр A4</span>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-6 flex justify-center">
          <div
            className="bg-white shadow-md prose prose-sm max-w-none"
            style={{
              width: "210mm",
              minWidth: "210mm",
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
      </div>

    </div>
  );
}
