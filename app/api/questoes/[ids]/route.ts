import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ids: string }> }
) {
  const { ids } = await params;
  const idList = ids.split(",").map(Number).filter(Boolean);

  const questoes = await prisma.questao.findMany({
    where: { id: { in: idList } },
    include: {
      alternativas: { orderBy: { letra: "asc" } },
      subtema: { include: { tema: { include: { disciplina: true } } } },
    },
  });

  // Preserve the order the user selected them
  const ordenadas = idList.map((id) => questoes.find((q) => q.id === id)).filter(Boolean);
  return NextResponse.json(ordenadas);
}
