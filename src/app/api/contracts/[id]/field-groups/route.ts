import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const GroupSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().optional(),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    select: { template: { include: { fieldGroups: { orderBy: { order: "asc" } } } } },
  });
  if (!contract?.template) return NextResponse.json([]);
  return NextResponse.json(contract.template.fieldGroups);
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    select: { template: { select: { id: true } } },
  });

  let templateId = contract?.template?.id;
  if (!templateId) {
    const t = await prisma.contractTemplate.create({
      data: { contractTypeId: id, content: "" },
    });
    templateId = t.id;
  }

  const body = await req.json();
  const parsed = GroupSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const group = await prisma.fieldGroup.create({
    data: { templateId, ...parsed.data },
  });
  return NextResponse.json(group, { status: 201 });
}
