import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { transliterate } from "@/lib/transliterate";

const CreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const contracts = await prisma.contractType.findMany({
    include: { seo: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Auto-generate unique slug from name via transliteration
  const baseSlug = transliterate(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.contractType.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const contract = await prisma.contractType.create({
    data: { ...parsed.data, slug },
  });
  return NextResponse.json(contract, { status: 201 });
}
