import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SectionUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  order: z.number().int().optional(),
  defaultEnabled: z.boolean().optional(),
});

interface Ctx { params: Promise<{ id: string; sid: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { sid } = await params;
  const parsed = SectionUpdateSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const section = await prisma.contractSection.update({
    where: { id: sid },
    data: parsed.data,
  });
  return NextResponse.json(section);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { sid } = await params;
  await prisma.contractSection.delete({ where: { id: sid } });
  return new Response(null, { status: 204 });
}
