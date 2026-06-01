import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TemplateSchema = z.object({ content: z.string() });

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const template = await prisma.contractTemplate.findUnique({ where: { contractTypeId: id } });
  return NextResponse.json(template);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = TemplateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const template = await prisma.contractTemplate.upsert({
    where: { contractTypeId: id },
    update: { content: parsed.data.content, version: { increment: 1 } },
    create: { contractTypeId: id, content: parsed.data.content },
  });
  return NextResponse.json(template);
}
