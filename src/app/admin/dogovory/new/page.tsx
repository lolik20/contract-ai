"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { transliterate } from "@/lib/transliterate";

const schema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewContractPage() {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const name = useWatch({ control, name: "name", defaultValue: "" });
  const slugPreview = name ? transliterate(name) : "";

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const contract = await res.json();
      router.push(`/admin/dogovory/${contract.id}`);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/dogovory" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Назад
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать договор</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input
            {...register("name")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Договор аренды жилой квартиры"
            autoFocus
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          {slugPreview && (
            <p className="text-xs text-gray-400 mt-1">
              URL: <span className="font-mono text-gray-600">/dogovory/{slugPreview}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Краткое описание типа договора"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Создание..." : "Создать"}
        </button>
      </form>
    </div>
  );
}
