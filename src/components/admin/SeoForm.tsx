"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import type { ContractSeo } from "@prisma/client";

const schema = z.object({
  pageTitle: z.string().min(1, "Обязательное поле"),
  metaDescription: z.string().min(1, "Обязательное поле"),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  h1: z.string().optional(),
  introText: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  contractId: string;
  seo: ContractSeo | null;
}

export function SeoForm({ contractId, seo }: Props) {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: seo
      ? {
          pageTitle: seo.pageTitle,
          metaDescription: seo.metaDescription,
          keywords: seo.keywords ?? "",
          ogTitle: seo.ogTitle ?? "",
          ogDescription: seo.ogDescription ?? "",
          h1: seo.h1 ?? "",
          introText: seo.introText ?? "",
        }
      : {},
  });

  const title = watch("pageTitle") ?? "";
  const desc = watch("metaDescription") ?? "";

  const onSubmit = async (data: FormData) => {
    const res = await fetch(`/api/contracts/${contractId}/seo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Title (заголовок страницы)</label>
          <span className={`text-xs ${title.length > 60 ? "text-red-500" : "text-gray-400"}`}>
            {title.length}/60
          </span>
        </div>
        <input
          {...register("pageTitle")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Договор аренды квартиры — скачать бесплатно | Договорились.ру"
        />
        {errors.pageTitle && <p className="text-red-500 text-xs mt-1">{errors.pageTitle.message}</p>}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Meta Description</label>
          <span className={`text-xs ${desc.length > 160 ? "text-red-500" : "text-gray-400"}`}>
            {desc.length}/160
          </span>
        </div>
        <textarea
          {...register("metaDescription")}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Описание для поисковой выдачи"
        />
        {errors.metaDescription && <p className="text-red-500 text-xs mt-1">{errors.metaDescription.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
        <input
          {...register("keywords")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="договор аренды, шаблон договора, ..."
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Open Graph</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">OG Title</label>
            <input
              {...register("ogTitle")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">OG Description</label>
            <textarea
              {...register("ogDescription")}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Контент страницы</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">H1 заголовок</label>
            <input
              {...register("h1")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Вводный текст (над формой)</label>
            <textarea
              {...register("introText")}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Сохранение..." : "Сохранить SEO"}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Сохранено</span>}
      </div>
    </form>
  );
}
