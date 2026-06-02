"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ContractSection } from "@prisma/client";

const schema = z.object({
  title: z.string().min(1, "Введите заголовок"),
  content: z.string(),
  order: z.number().int(),
  defaultEnabled: z.boolean(),
});

type FormData = {
  title: string;
  content: string;
  order: number;
  defaultEnabled: boolean;
};

interface Props {
  contractId: string;
  section?: ContractSection;
  defaultOrder?: number;
  onSaved: () => void;
  onCancel: () => void;
}

export function SectionEditor({ contractId, section, defaultOrder = 0, onSaved, onCancel }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: section?.title ?? "",
      content: section?.content ?? "",
      order: section?.order ?? defaultOrder,
      defaultEnabled: section?.defaultEnabled ?? true,
    },
  });

  useEffect(() => {
    reset({
      title: section?.title ?? "",
      content: section?.content ?? "",
      order: section?.order ?? defaultOrder,
      defaultEnabled: section?.defaultEnabled ?? true,
    });
  }, [section?.id]);

  const onSubmit = async (data: FormData) => {
    const url = section
      ? `/api/contracts/${contractId}/sections/${section.id}`
      : `/api/contracts/${contractId}/sections`;
    const method = section ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Заголовок раздела</label>
        <input
          {...register("title")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Например: Права и обязанности арендатора"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Текст раздела (HTML)</label>
        <textarea
          {...register("content")}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="<p>Текст раздела. Можно использовать {{поля}}.</p>"
        />
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Порядок</label>
          <input
            type="number"
            {...register("order")}
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            id="defaultEnabled"
            {...register("defaultEnabled")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="defaultEnabled" className="text-sm text-gray-700">
            Включён по умолчанию
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Сохранение…" : section ? "Сохранить" : "Добавить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
