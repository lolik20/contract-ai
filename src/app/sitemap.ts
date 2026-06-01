import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dogovorilos.ru";

  const contracts = await prisma.contractType.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...contracts.map((c) => ({
      url: `${base}/dogovory/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
