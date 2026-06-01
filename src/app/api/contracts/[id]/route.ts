import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { transliterate } from "@/lib/transliterate";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    include: { seo: true, template: { include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = { ...parsed.data };

  // If name changed — recalculate slug
  if (parsed.data.name) {
    const baseSlug = transliterate(parsed.data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const existing = await prisma.contractType.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${suffix++}`;
    }
    data.slug = slug;
  }

  const contract = await prisma.contractType.update({ where: { id }, data });
  return NextResponse.json(contract);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.contractType.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
