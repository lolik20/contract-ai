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
  groupId: z.string().nullable().optional(),
});

interface Ctx { params: Promise<{ id: string; fid: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { fid } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const field = await prisma.templateField.update({
    where: { id: fid },
    data: parsed.data,
  });
  return NextResponse.json(field);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { fid } = await params;
  await prisma.templateField.delete({ where: { id: fid } });
  return new NextResponse(null, { status: 204 });
}
