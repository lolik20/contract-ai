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

interface Ctx { params: Promise<{ id: string; sid: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { sid } = await params;
  const fields = await prisma.sectionField.findMany({
    where: { sectionId: sid },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(fields);
}

export async function POST(req: Request, { params }: Ctx) {
  const { sid } = await params;
  const parsed = FieldSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const field = await prisma.sectionField.create({
    data: { sectionId: sid, ...parsed.data },
  });
  return NextResponse.json(field, { status: 201 });
}
