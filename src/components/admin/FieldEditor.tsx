"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import type { TemplateField } from "@prisma/client";
import { transliterate } from "@/lib/transliterate";

const FIELD_TYPES = [
  { value: "TEXT", label: "Текст" },
  { value: "TEXTAREA", label: "Многострочный текст" },
  { value: "DATE", label: "Дата" },
  { value: "NUMBER", label: "Число" },
  { value: "SELECT", label: "Список" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Телефон" },
];

const schema = z.object({
  name: z.string().regex(/^[a-z_]+$/, "Только строчные латинские и _"),
  label: z.string().min(1, "Обязательное поле"),
  type: z.enum(["TEXT", "TEXTAREA", "DATE", "NUMBER", "SELECT", "EMAIL", "PHONE"]),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  required: z.boolean(),
  order: z.number().int(),
  options: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  contractId: string;
  field?: TemplateField | null;
  defaultOrder?: number;
  onSaved: () => void;
  onCancel: () => void;
}

export function FieldEditor({ contractId, field, defaultOrder = 0, onSaved, onCancel }: Props) {
  const isNew = !field;
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: field
        ? {
            name: field.name,
            label: field.label,
            type: field.type as FormData["type"],
            placeholder: field.placeholder ?? "",
            defaultValue: field.defaultValue ?? "",
            required: field.required,
            order: field.order,
            options: field.options ?? "",
          }
        : { type: "TEXT", required: true, order: defaultOrder },
    });

  const type = watch("type");
  const label = useWatch({ control, name: "label", defaultValue: "" });

  // Auto-generate name from label for new fields
  useEffect(() => {
    if (!isNew) return;
    const generated = transliterate(label).replace(/-/g, "_");
    setValue("name", generated, { shouldValidate: false });
  }, [label, isNew, setValue]);

  const onSubmit = async (data: FormData) => {
    const url = field
      ? `/api/contracts/${contractId}/fields/${field.id}`
      : `/api/contracts/${contractId}/fields`;
    const method = field ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Подпись (label)
        </label>
        <input
          {...register("label")}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ФИО арендатора"
          autoFocus
        />
        {errors.label && <p className="text-red-500 text-xs mt-0.5">{errors.label.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Имя поля {isNew && <span className="text-gray-400">(авто)</span>}
          </label>
          <input
            {...register("name")}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tenant_name"
            readOnly={!!field}
          />
          {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Тип</label>
          <select
            {...register("type")}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            {...register("placeholder")}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Значение по умолчанию</label>
          <input
            {...register("defaultValue")}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {type === "SELECT" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Варианты (JSON массив)
          </label>
          <input
            {...register("options")}
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='["Вариант 1", "Вариант 2"]'
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Порядок</label>
          <input
            {...register("order", { valueAsNumber: true })}
            type="number"
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("required")} className="w-4 h-4" />
            <span className="text-gray-700">Обязательное</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Сохранение..." : field ? "Обновить" : "Добавить"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded text-sm border border-gray-300 hover:bg-gray-50">
          Отмена
        </button>
      </div>
    </form>
  );
}
