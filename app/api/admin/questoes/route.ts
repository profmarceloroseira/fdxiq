import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { enunciado, tipo, dificuldade, secao, fonte, anoFonte, resolucao, gabarito, subtemaId, alternativas } = body;

  if (!enunciado || !subtemaId) {
    return NextResponse.json({ error: "Enunciado e subtema são obrigatórios." }, { status: 400 });
  }

  const questao = await prisma.questao.create({
    data: {
      enunciado,
      tipo: tipo ?? "multipla_escolha",
      dificuldade: dificuldade ?? "medio",
      secao: secao ?? "problema",
      fonte,
      anoFonte: anoFonte ? parseInt(anoFonte) : null,
      resolucao,
      gabarito,
      subtemaId: parseInt(subtemaId),
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

  return NextResponse.json(questao, { status: 201 });
}
