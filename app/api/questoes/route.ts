import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("busca") ?? "";
  const subtemaId = searchParams.get("subtema");
  const dificuldade = searchParams.get("dificuldade");
  const secao = searchParams.get("secao");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where: any = { ativo: true };
  if (busca) where.enunciado = { contains: busca };
  if (subtemaId) where.subtemaId = parseInt(subtemaId);
  if (dificuldade) where.dificuldade = dificuldade;
  if (secao) where.secao = secao;

  const [total, questoes] = await Promise.all([
    prisma.questao.count({ where }),
    prisma.questao.findMany({
      where,
      include: {
        alternativas: { orderBy: { letra: "asc" } },
        subtema: { include: { tema: { include: { disciplina: true } } } },
      },
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ questoes, total, page, pages: Math.ceil(total / limit) });
}
