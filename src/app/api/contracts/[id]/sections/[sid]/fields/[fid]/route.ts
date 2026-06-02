import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  name: z.string().regex(/^[a-z_]+$/).optional(),
  label: z.string().min(1).optional(),
  type: z.nativeEnum(FieldType).optional(),
  placeholder: z.string().nullable().optional(),
  defaultValue: z.string().nullable().optional(),
  required: z.boolean().optional(),
  order: z.number().int().optional(),
  options: z.string().nullable().optional(),
});

interface Ctx { params: Promise<{ id: string; sid: string; fid: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { fid } = await params;
  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const field = await prisma.sectionField.update({
    where: { id: fid },
    data: parsed.data,
  });
  return NextResponse.json(field);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { fid } = await params;
  await prisma.sectionField.delete({ where: { id: fid } });
  return new NextResponse(null, { status: 204 });
}
