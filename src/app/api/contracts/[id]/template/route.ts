import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TemplateSchema = z.object({
  content: z.string().optional(),
  party1Label: z.string().optional(),
  party2Label: z.string().optional(),
});

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

  const { content, party1Label, party2Label } = parsed.data;

  const update: Prisma.ContractTemplateUpdateInput = {};
  if (content !== undefined) {
    update.content = content;
    update.version = { increment: 1 };
  }
  if (party1Label !== undefined) update.party1Label = party1Label;
  if (party2Label !== undefined) update.party2Label = party2Label;

  const template = await prisma.contractTemplate.upsert({
    where: { contractTypeId: id },
    update,
    create: {
      contractTypeId: id,
      content: content ?? "",
      ...(party1Label !== undefined ? { party1Label } : {}),
      ...(party2Label !== undefined ? { party2Label } : {}),
    },
  });
  return NextResponse.json(template);
}
