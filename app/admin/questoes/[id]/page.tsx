import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormularioQuestao from "@/components/FormularioQuestao";

export default async function EditarQuestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const questao = await prisma.questao.findUnique({
    where: { id: parseInt(id) },
    include: { alternativas: { orderBy: { letra: "asc" } } },
  });

  if (!questao) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</a>
          <h1 className="text-lg font-bold text-gray-800">Editar questão Q{questao.id}</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <FormularioQuestao
            inicial={{
              id: questao.id,
              enunciado: questao.enunciado,
              tipo: questao.tipo,
              dificuldade: questao.dificuldade,
              secao: questao.secao,
              fonte: questao.fonte ?? undefined,
              anoFonte: questao.anoFonte,
              resolucao: questao.resolucao ?? undefined,
              gabarito: questao.gabarito ?? undefined,
              subtemaId: questao.subtemaId ?? undefined,
              alternativas: questao.alternativas,
            }}
          />
        </div>
      </div>
    </div>
  );
}
