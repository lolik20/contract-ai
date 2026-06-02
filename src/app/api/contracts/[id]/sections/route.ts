import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(""),
  order: z.number().int().default(0),
  defaultEnabled: z.boolean().default(true),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const template = await prisma.contractTemplate.findUnique({
    where: { contractTypeId: id },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(template?.sections ?? []);
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const parsed = SectionSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let template = await prisma.contractTemplate.findUnique({ where: { contractTypeId: id } });
  if (!template) {
    template = await prisma.contractTemplate.create({
      data: { contractTypeId: id, content: "" },
    });
  }

  const section = await prisma.contractSection.create({
    data: { templateId: template.id, ...parsed.data },
  });
  return NextResponse.json(section, { status: 201 });
}
