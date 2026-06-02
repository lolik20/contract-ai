"use client";

import { useState } from "react";
import type { TemplateField, FieldGroup } from "@prisma/client";
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

const UNGROUPED = "__ungrouped__";

interface Props {
  contractId: string;
  initialFields: TemplateField[];
  initialGroups: FieldGroup[];
}

export function FieldGroupsManager({ contractId, initialFields, initialGroups }: Props) {
  const [fields, setFields] = useState(() => [...initialFields].sort((a, b) => a.order - b.order));
  const [groups, setGroups] = useState(() => [...initialGroups].sort((a, b) => a.order - b.order));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addTarget, setAddTarget] = useState<string | null>(null); // group.id | UNGROUPED | null
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const fieldsBase = `/api/contracts/${contractId}/fields`;
  const groupsBase = `/api/contracts/${contractId}/field-groups`;
  const groupOptions = groups.map((g) => ({ id: g.id, title: g.title }));

  const reloadFields = async () => {
    const data: TemplateField[] = await (await fetch(fieldsBase)).json();
    setFields([...data].sort((a, b) => a.order - b.order));
  };
  const reloadGroups = async () => {
    const data: FieldGroup[] = await (await fetch(groupsBase)).json();
    setGroups([...data].sort((a, b) => a.order - b.order));
  };

  const deleteField = async (id: string) => {
    if (!confirm("Удалить поле?")) return;
    await fetch(`${fieldsBase}/${id}`, { method: "DELETE" });
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const addGroup = async () => {
    const title = newGroupTitle.trim();
    if (!title) return;
    await fetch(groupsBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, order: groups.length + 1 }),
    });
    setNewGroupTitle("");
    setAddingGroup(false);
    await reloadGroups();
  };

  const renameGroup = async (id: string) => {
    const title = renameVal.trim();
    if (title) {
      await fetch(`${groupsBase}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      await reloadGroups();
    }
    setRenamingId(null);
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Удалить группу? Поля останутся, но станут без группы.")) return;
    await fetch(`${groupsBase}/${id}`, { method: "DELETE" });
    await Promise.all([reloadGroups(), reloadFields()]);
  };

  const renderField = (field: TemplateField) => (
    <div key={field.id}>
      {editingId === field.id ? (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <FieldEditor
            contractId={contractId}
            field={field}
            groups={groupOptions}
            onSaved={async () => { setEditingId(null); await reloadFields(); }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 w-5 text-right shrink-0">{field.order}</span>
            <div className="min-w-0">
              <span className="text-sm font-medium text-gray-900">{field.label}</span>
              <span className="ml-2 font-mono text-xs text-gray-400">{`{{${field.name}}}`}</span>
              {field.required && <span className="ml-1 text-red-400 text-xs">*</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{TYPE_LABELS[field.type]}</span>
            <button onClick={() => setEditingId(field.id)} className="text-xs text-blue-500 hover:text-blue-700">Изменить</button>
            <button onClick={() => deleteField(field.id)} className="text-xs text-red-400 hover:text-red-600">Удалить</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdd = (target: string, groupId: string | null) =>
    addTarget === target ? (
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Новое поле</h4>
        <FieldEditor
          contractId={contractId}
          defaultOrder={fields.length + 1}
          groups={groupOptions}
          defaultGroupId={groupId}
          onSaved={async () => { setAddTarget(null); await reloadFields(); }}
          onCancel={() => setAddTarget(null)}
        />
      </div>
    ) : (
      <button onClick={() => setAddTarget(target)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
        + Добавить поле
      </button>
    );

  const ungrouped = fields.filter((f) => !f.groupId);

  return (
    <div className="space-y-5">
      {/* Группы полей */}
      {groups.map((group) => {
        const groupFields = fields.filter((f) => f.groupId === group.id);
        return (
          <div key={group.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              {renamingId === group.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={() => renameGroup(group.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") renameGroup(group.id); }}
                  className="text-sm font-semibold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h3 className="text-sm font-semibold text-gray-800">{group.title}</h3>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRenamingId(group.id); setRenameVal(group.title); }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Переименовать
                </button>
                <button onClick={() => deleteGroup(group.id)} className="text-xs text-red-400 hover:text-red-600">
                  Удалить группу
                </button>
              </div>
            </div>
            <div className="space-y-2 mb-2">
              {groupFields.length === 0 && <p className="text-xs text-gray-400 py-1">Полей нет</p>}
              {groupFields.map(renderField)}
            </div>
            {renderAdd(group.id, group.id)}
          </div>
        );
      })}

      {/* Поля без группы */}
      <div>
        {groups.length > 0 && <h3 className="text-sm font-semibold text-gray-500 mb-2">Без группы</h3>}
        <div className="space-y-2 mb-2">
          {ungrouped.length === 0 && <p className="text-sm text-gray-400 py-2">Полей нет</p>}
          {ungrouped.map(renderField)}
        </div>
        {renderAdd(UNGROUPED, null)}
      </div>

      {/* Добавить группу */}
      <div className="pt-1 border-t border-gray-100">
        {addingGroup ? (
          <div className="flex items-center gap-2 pt-3">
            <input
              autoFocus
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addGroup(); }}
              placeholder="Название группы"
              className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={addGroup} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
              Добавить
            </button>
            <button onClick={() => { setAddingGroup(false); setNewGroupTitle(""); }} className="text-xs text-gray-500 hover:text-gray-700">
              Отмена
            </button>
          </div>
        ) : (
          <button onClick={() => setAddingGroup(true)} className="text-sm text-blue-600 hover:text-blue-800 font-medium pt-3">
            + Добавить группу полей
          </button>
        )}
      </div>
    </div>
  );
}
