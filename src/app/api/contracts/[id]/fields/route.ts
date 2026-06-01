import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const FieldSchema = z.object({
  name: z.string().regex(/^[a-z_]+$/),
  label: z.string().min(1),
  type: z.nativeEnum(FieldType).optional(),
  placeholder: z.string().nullable().optional(),
  defaultValue: z.string().nullable().optional(),
  required: z.boolean().optional(),
  order: z.number().int().optional(),
  options: z.string().nullable().optional(),
});

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const contract = await prisma.contractType.findUnique({
    where: { id },
    select: { template: { include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!contract?.template) return NextResponse.json([]);
  return NextResponse.json(contract.template.fields);
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
  const parsed = FieldSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const field = await prisma.templateField.create({
    data: { templateId, ...parsed.data },
  });
  return NextResponse.json(field, { status: 201 });
}
