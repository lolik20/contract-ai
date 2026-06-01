import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const contracts = await prisma.contractType.findMany({
    include: { seo: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const contract = await prisma.contractType.create({
    data: parsed.data,
  });
  return NextResponse.json(contract, { status: 201 });
}
