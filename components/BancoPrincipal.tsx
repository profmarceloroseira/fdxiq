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

  const temFiltros = busca || subtemaId || dificuldade || secao;

  // Group subtemas by tema
  const temas = subtemas.reduce<Record<string, Subtema[]>>((acc, s) => {
    const t = s.tema.nome;
    if (!acc[t]) acc[t] = [];
    acc[t].push(s);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen" style={{ background: "#f4f5f7" }}>

      {/* ── Sidebar escura ── */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: "#0f2137", color: "#c8d6e5" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "#1e3a55" }}>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#4da6ff" }}>
            FDX Preparatório
          </p>
          <h1 className="text-xl font-bold text-white mt-0.5">FDX IQ</h1>
          <p className="text-xs mt-0.5" style={{ color: "#7a9bb5" }}>Banco de Questões</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem icon="⊞" label="Banco de Questões" active />
          <a
            href={selecionadas.size > 0 ? `/prova?ids=${[...selecionadas].join(",")}` : "#"}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              color: selecionadas.size > 0 ? "#4da6ff" : "#4a6a85",
              background: selecionadas.size > 0 ? "rgba(77,166,255,0.1)" : "transparent",
              cursor: selecionadas.size > 0 ? "pointer" : "not-allowed",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 16 }}>📋</span>
            <span>Montar Prova</span>
            {selecionadas.size > 0 && (
              <span
                className="ml-auto text-xs font-bold rounded-full px-2 py-0.5"
                style={{ background: "#4da6ff", color: "#0f2137" }}
              >
                {selecionadas.size}
              </span>
            )}
          </a>
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "#7a9bb5", textDecoration: "none" }}
          >
            <span style={{ fontSize: 16 }}>⚙</span>
            <span>Administração</span>
          </a>
        </nav>

        {/* Filtros na sidebar */}
        <div className="px-4 py-4 border-t space-y-4" style={{ borderColor: "#1e3a55" }}>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: "#4a6a85" }}>
            Filtros
          </p>

          {/* Tópico */}
          <div>
            <p className="text-xs mb-1.5" style={{ color: "#7a9bb5" }}>Tópico</p>
            <select
              value={subtemaId}
              onChange={(e) => setSubtemaId(e.target.value)}
              className="w-full text-sm rounded-lg px-2.5 py-1.5 focus:outline-none"
              style={{
                background: "#1e3a55",
                color: "#c8d6e5",
                border: "1px solid #2a4f72",
              }}
            >
              <option value="">Todos os tópicos</option>
              {Object.entries(temas).map(([tema, subs]) => (
                <optgroup key={tema} label={tema} style={{ background: "#1e3a55" }}>
                  {subs.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Dificuldade */}
          <div>
            <p className="text-xs mb-1.5" style={{ color: "#7a9bb5" }}>Dificuldade</p>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { val: "", label: "Todas" },
                { val: "facil", label: "Fácil" },
                { val: "medio", label: "Médio" },
                { val: "dificil", label: "Difícil" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setDificuldade(val)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: dificuldade === val ? "#4da6ff" : "#1e3a55",
                    color: dificuldade === val ? "#0f2137" : "#7a9bb5",
                    fontWeight: dificuldade === val ? 600 : 400,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Seção */}
          <div>
            <p className="text-xs mb-1.5" style={{ color: "#7a9bb5" }}>Seção</p>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { val: "", label: "Todas" },
                { val: "problema", label: "Problema" },
                { val: "fixacao", label: "Fixação" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSecao(val)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: secao === val ? "#4da6ff" : "#1e3a55",
                    color: secao === val ? "#0f2137" : "#7a9bb5",
                    fontWeight: secao === val ? 600 : 400,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {temFiltros && (
            <button
              onClick={limparFiltros}
              className="text-xs w-full py-1.5 rounded-lg transition-colors"
              style={{ color: "#7a9bb5", background: "#1e3a55", border: "none", cursor: "pointer" }}
            >
              Limpar filtros ×
            </button>
          )}
        </div>

        {/* Contador */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "#1e3a55" }}>
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs" style={{ color: "#4a6a85" }}>questões encontradas</p>
          {selecionadas.size > 0 && (
            <p className="text-xs font-semibold mt-1" style={{ color: "#4da6ff" }}>
              {selecionadas.size} selecionada{selecionadas.size > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-3 flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar nas questões..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 bg-gray-50"
              style={{ maxWidth: 480 }}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarGabarito}
              onChange={(e) => setMostrarGabarito(e.target.checked)}
              className="accent-blue-600"
            />
            Mostrar gabarito
          </label>

          {selecionadas.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelecionadas(new Set())}
                className="text-sm text-gray-400 hover:text-gray-600 px-2"
              >
                Limpar
              </button>
              <a
                href={`/prova?ids=${[...selecionadas].join(",")}`}
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-white"
                style={{ background: "#0f2137", textDecoration: "none" }}
              >
                Montar Prova ({selecionadas.size}) →
              </a>
            </div>
          )}
        </header>

        {/* Lista */}
        <main className="flex-1 px-6 py-5 space-y-3">
          {loading ? (
            <div className="text-center py-24 text-gray-400 text-sm">Carregando questões...</div>
          ) : questoes.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-sm">Nenhuma questão encontrada.</div>
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

              {pages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4 pb-8">
                  <button
                    onClick={() => buscarQuestoes(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    Página {page} de {pages}
                  </span>
                  <button
                    onClick={() => buscarQuestoes(page + 1)}
                    disabled={page >= pages}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
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

function SidebarItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-default"
      style={{
        background: active ? "rgba(77,166,255,0.15)" : "transparent",
        color: active ? "#4da6ff" : "#7a9bb5",
        fontWeight: active ? 600 : 400,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
