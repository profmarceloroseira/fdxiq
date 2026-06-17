import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [totalQuestoes, temas] = await Promise.all([
    prisma.questao.count({ where: { ativo: true } }),
    prisma.tema.findMany({
      include: {
        subtemas: {
          include: { _count: { select: { questoes: { where: { ativo: true } } } } },
        },
      },
    }),
  ]);

  const questoesRecentes = await prisma.questao.findMany({
    where: { ativo: true },
    include: { subtema: { include: { tema: true } } },
    orderBy: { criadoEm: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-700">SuperProf — Admin</h1>
            <p className="text-xs text-gray-500">Gerenciamento do banco de questões</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              ← Ir para o banco
            </Link>
            <Link
              href="/admin/questoes/nova"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Nova questão
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{totalQuestoes}</p>
            <p className="text-xs text-gray-500 mt-1">Questões ativas</p>
          </div>
          {temas.map((tema) => (
            <div key={tema.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-2">{tema.nome}</p>
              {tema.subtemas.map((sub) => (
                <div key={sub.id} className="flex justify-between text-xs text-gray-500">
                  <span>{sub.nome}</span>
                  <span className="font-medium text-gray-700">{sub._count.questoes}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Questões recentes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Questões recentes</h2>
            <span className="text-xs text-gray-400">Últimas 10 adicionadas</span>
          </div>
          <div className="divide-y divide-gray-50">
            {questoesRecentes.map((q) => (
              <div key={q.id} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-gray-400">Q{q.id}</span>
                    {q.subtema && (
                      <span className="text-xs text-blue-600">{q.subtema.tema.nome} › {q.subtema.nome}</span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      q.dificuldade === "facil" ? "bg-green-100 text-green-700" :
                      q.dificuldade === "dificil" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {q.dificuldade === "facil" ? "Fácil" : q.dificuldade === "dificil" ? "Difícil" : "Médio"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{q.enunciado.replace(/\$[^$]+\$/g, "[fórmula]")}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/questoes/${q.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={q.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ id }: { id: number }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma: db } = await import("@/lib/prisma");
        await db.questao.update({ where: { id }, data: { ativo: false } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin");
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
        onClick={(e) => {
          if (!confirm("Desativar esta questão?")) e.preventDefault();
        }}
      >
        Remover
      </button>
    </form>
  );
}
