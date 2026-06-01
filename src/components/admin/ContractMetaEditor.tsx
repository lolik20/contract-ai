"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

export function ContractMetaEditor({ id, name, description, slug }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(name);
  const [descVal, setDescVal] = useState(description ?? "");
  const [saving, setSaving] = useState(false);
  const [currentSlug, setCurrentSlug] = useState(slug);
  const router = useRouter();

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameVal, description: descVal || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCurrentSlug(updated.slug);
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{nameVal}</h1>
          {descVal && <p className="text-sm text-gray-500 mt-1">{descVal}</p>}
          <p className="text-xs text-gray-400 mt-1 font-mono">/dogovory/{currentSlug}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="shrink-0 text-sm text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          Изменить
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Название</label>
        <input
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <p className="text-xs text-gray-400 mt-1">Slug будет пересчитан автоматически</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Описание</label>
        <textarea
          value={descVal}
          onChange={(e) => setDescVal(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !nameVal.trim()}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          onClick={() => { setEditing(false); setNameVal(name); setDescVal(description ?? ""); }}
          className="px-4 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
