import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subtemas = await prisma.subtema.findMany({
    include: { tema: { include: { disciplina: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(subtemas);
}
