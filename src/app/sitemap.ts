import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://dogovorilos.ru";

  const contracts = await prisma.contractType.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/neuro`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/tarify`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/politika-konfidencialnosti`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/oferta`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...contracts.map((c) => ({
      url: `${base}/dogovory/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
