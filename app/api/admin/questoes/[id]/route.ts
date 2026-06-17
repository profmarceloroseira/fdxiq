import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const questao = await prisma.questao.findUnique({
    where: { id: parseInt(id) },
    include: {
      alternativas: { orderBy: { letra: "asc" } },
      subtema: { include: { tema: { include: { disciplina: true } } } },
    },
  });
  if (!questao) return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  return NextResponse.json(questao);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { enunciado, tipo, dificuldade, secao, fonte, anoFonte, resolucao, gabarito, subtemaId, alternativas, ativo } = body;

  // Update the question and replace alternatives
  await prisma.alternativa.deleteMany({ where: { questaoId: parseInt(id) } });

  const questao = await prisma.questao.update({
    where: { id: parseInt(id) },
    data: {
      enunciado,
      tipo,
      dificuldade,
      secao,
      fonte,
      anoFonte: anoFonte ? parseInt(anoFonte) : null,
      resolucao,
      gabarito,
      subtemaId: parseInt(subtemaId),
      ativo: ativo ?? true,
      alternativas: {
        create: (alternativas ?? []).map((a: { letra: string; texto: string; correta: boolean }) => ({
          letra: a.letra,
          texto: a.texto,
          correta: a.correta,
        })),
      },
    },
    include: { alternativas: true },
  });

  return NextResponse.json(questao);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.questao.update({
    where: { id: parseInt(id) },
    data: { ativo: false },
  });
  return NextResponse.json({ ok: true });
}
