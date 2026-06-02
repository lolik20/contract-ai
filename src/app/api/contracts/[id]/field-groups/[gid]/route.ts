import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  order: z.number().int().optional(),
});

interface Ctx { params: Promise<{ id: string; gid: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const { gid } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const group = await prisma.fieldGroup.update({
    where: { id: gid },
    data: parsed.data,
  });
  return NextResponse.json(group);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { gid } = await params;
  // Поля группы не удаляются — groupId сбрасывается в null (onDelete: SetNull).
  await prisma.fieldGroup.delete({ where: { id: gid } });
  return new NextResponse(null, { status: 204 });
}
