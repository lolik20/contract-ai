"use client";

import { useState } from "react";

interface Props {
  contractId: string;
  initialParty1Label: string;
  initialParty2Label: string;
}

/** Редактор подписей сторон (метки, попадающие в готовый документ). */
export function SignatureLabelsEditor({ contractId, initialParty1Label, initialParty2Label }: Props) {
  const [party1Label, setParty1Label] = useState(initialParty1Label);
  const [party2Label, setParty2Label] = useState(initialParty2Label);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/contracts/${contractId}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party1Label, party2Label }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Не удалось сохранить подписи сторон");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs text-gray-400">Сторона 1</span>
        <input
          type="text"
          value={party1Label}
          onChange={(e) => { setParty1Label(e.target.value); setSaved(false); }}
          className="mt-0.5 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <label className="block">
        <span className="text-xs text-gray-400">Сторона 2</span>
        <input
          type="text"
          value={party2Label}
          onChange={(e) => { setParty2Label(e.target.value); setSaved(false); }}
          className="mt-0.5 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
        {saved && <span className="text-xs text-green-600">✓ Сохранено</span>}
      </div>
    </div>
  );
}
