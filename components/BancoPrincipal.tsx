"use client";

import { useEffect, useState, useCallback } from "react";
import QuestaoCard from "./QuestaoCard";

interface Subtema {
  id: number;
  nome: string;
  tema: { nome: string; disciplina: { nome: string } };
}

interface Questao {
  id: number;
  enunciado: string;
  gabarito: string | null;
  resolucao: string | null;
  dificuldade: string;
  secao: string;
  fonte: string | null;
  anoFonte: number | null;
  alternativas: { id: number; letra: string; texto: string; correta: boolean }[];
  subtema?: { nome: string; tema?: { nome: string } } | null;
}

export default function BancoPrincipal() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [busca, setBusca] = useState("");
  const [subtemaId, setSubtemaId] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [secao, setSecao] = useState("");
  const [mostrarGabarito, setMostrarGabarito] = useState(false);

  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/subtemas").then((r) => r.json()).then(setSubtemas);
  }, []);

  const buscarQuestoes = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (busca) params.set("busca", busca);
    if (subtemaId) params.set("subtema", subtemaId);
    if (dificuldade) params.set("dificuldade", dificuldade);
    if (secao) params.set("secao", secao);

    const res = await fetch(`/api/questoes?${params}`);
    const data = await res.json();
    setQuestoes(data.questoes);
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }, [busca, subtemaId, dificuldade, secao]);

  useEffect(() => {
    buscarQuestoes(1);
  }, [buscarQuestoes]);

  const toggleSelecao = (id: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const limparFiltros = () => {
    setBusca("");
    setSubtemaId("");
    setDificuldade("");
    setSecao("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-700">SuperProf</h1>
            <p className="text-xs text-gray-500">Banco de Questões de Matemática</p>
          </div>
          <div className="flex items-center gap-3">
            {selecionadas.size > 0 && (
              <a
                href={`/prova?ids=${[...selecionadas].join(",")}`}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Montar Prova ({selecionadas.size})
              </a>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarGabarito}
                onChange={(e) => setMostrarGabarito(e.target.checked)}
                className="accent-blue-600"
              />
              Mostrar gabarito
            </label>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar de filtros */}
        <aside className="w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">Filtros</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Subtema</label>
                <select
                  value={subtemaId}
                  onChange={(e) => setSubtemaId(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Todos</option>
                  {subtemas.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Dificuldade</label>
                <select
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Todas</option>
                  <option value="facil">Fácil</option>
                  <option value="medio">Médio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Seção</label>
                <select
                  value={secao}
                  onChange={(e) => setSecao(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Todas</option>
                  <option value="problema">Problemas</option>
                  <option value="fixacao">Fixação</option>
                </select>
              </div>

              <button
                onClick={limparFiltros}
                className="w-full text-xs text-gray-500 hover:text-gray-700 underline mt-1"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{total}</p>
            <p className="text-xs text-blue-600">questões encontradas</p>
            {selecionadas.size > 0 && (
              <p className="text-xs text-green-700 font-medium mt-1">{selecionadas.size} selecionadas</p>
            )}
          </div>
        </aside>

        {/* Lista de questões */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Barra de busca */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar nas questões..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm"
            />
            {selecionadas.size > 0 && (
              <button
                onClick={() => setSelecionadas(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700 px-3"
              >
                Limpar seleção
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Carregando...</div>
          ) : questoes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Nenhuma questão encontrada.</div>
          ) : (
            <>
              {questoes.map((q) => (
                <QuestaoCard
                  key={q.id}
                  questao={q}
                  selecionada={selecionadas.has(q.id)}
                  onToggleSelecao={toggleSelecao}
                  mostrarGabarito={mostrarGabarito}
                />
              ))}

              {/* Paginação */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <button
                    onClick={() => buscarQuestoes(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {page} / {pages}
                  </span>
                  <button
                    onClick={() => buscarQuestoes(page + 1)}
                    disabled={page >= pages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
