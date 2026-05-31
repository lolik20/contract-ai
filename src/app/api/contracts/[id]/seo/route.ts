import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SeoSchema = z.object({
  pageTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  keywords: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  h1: z.string().nullable().optional(),
  introText: z.string().nullable().optional(),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const seo = await prisma.contractSeo.findUnique({ where: { contractTypeId: id } });
  return NextResponse.json(seo);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = SeoSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const seo = await prisma.contractSeo.upsert({
    where: { contractTypeId: id },
    update: parsed.data,
    create: { contractTypeId: id, ...parsed.data },
  });
  return NextResponse.json(seo);
}
