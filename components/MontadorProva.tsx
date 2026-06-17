"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import MathText from "./MathText";

interface Alternativa {
  id: number;
  letra: string;
  texto: string;
  correta: boolean;
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
  alternativas: Alternativa[];
  subtema?: { nome: string; tema?: { nome: string } } | null;
}

export default function MontadorProva() {
  const searchParams = useSearchParams();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("Prova");
  const [instrucoes, setInstrucoes] = useState(
    "Responda todas as questões. Cada questão vale 1 ponto."
  );
  const [mostrarGabarito, setMostrarGabarito] = useState(false);
  const [ordem, setOrdem] = useState<number[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (!ids) { setLoading(false); return; }

    fetch(`/api/questoes/${ids}`)
      .then((r) => r.json())
      .then((data: Questao[]) => {
        setQuestoes(data);
        setOrdem(data.map((q) => q.id));
        setLoading(false);
      });
  }, [searchParams]);

  const moverQuestao = (id: number, direcao: "cima" | "baixo") => {
    setOrdem((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swap = direcao === "cima" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const removerQuestao = (id: number) => {
    setOrdem((prev) => prev.filter((x) => x !== id));
  };

  const questoesOrdenadas = ordem
    .map((id) => questoes.find((q) => q.id === id))
    .filter(Boolean) as Questao[];

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  if (questoesOrdenadas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4">
        <p>Nenhuma questão selecionada.</p>
        <a href="/" className="text-blue-600 hover:underline text-sm">← Voltar ao banco</a>
      </div>
    );
  }

  return (
    <>
      {/* Controles — ocultados na impressão */}
      <div className="no-print bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar ao banco
          </a>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarGabarito}
                onChange={(e) => setMostrarGabarito(e.target.checked)}
                className="accent-blue-600"
              />
              Incluir gabarito
            </label>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              🖨 Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
        {/* Painel de edição — ocultado na impressão */}
        <aside className="no-print w-52 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">Configurar prova</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Instruções</label>
              <textarea
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">
              Ordem das questões ({questoesOrdenadas.length})
            </h2>
            <div className="space-y-1">
              {questoesOrdenadas.map((q, i) => (
                <div key={q.id} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                  <span className="font-medium w-4">{i + 1}.</span>
                  <span className="flex-1 truncate">Q{q.id}</span>
                  <button
                    onClick={() => moverQuestao(q.id, "cima")}
                    disabled={i === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    title="Mover para cima"
                  >▲</button>
                  <button
                    onClick={() => moverQuestao(q.id, "baixo")}
                    disabled={i === questoesOrdenadas.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    title="Mover para baixo"
                  >▼</button>
                  <button
                    onClick={() => removerQuestao(q.id)}
                    className="text-red-400 hover:text-red-600 ml-0.5"
                    title="Remover"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Folha da prova */}
        <div ref={printRef} className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 print-area">
            {/* Cabeçalho */}
            <div className="text-center mb-6 pb-4 border-b border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
              {instrucoes && (
                <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">{instrucoes}</p>
              )}
              <div className="flex justify-between text-xs text-gray-400 mt-3">
                <span>Nome: _______________________________</span>
                <span>Data: ___/___/______</span>
                <span>Nota: ______</span>
              </div>
            </div>

            {/* Questões */}
            <div className="space-y-6">
              {questoesOrdenadas.map((q, i) => (
                <div key={q.id} className="break-inside-avoid">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    {i + 1}.{" "}
                    <MathText text={q.enunciado} />
                  </p>
                  <div className="space-y-1 ml-4">
                    {q.alternativas.map((alt) => (
                      <div
                        key={alt.id}
                        className={`text-sm flex gap-2 ${
                          mostrarGabarito && alt.correta
                            ? "font-semibold text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="font-medium w-5">{alt.letra})</span>
                        <MathText text={alt.texto} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Gabarito — só aparece se ativado */}
            {mostrarGabarito && (
              <div className="mt-8 pt-4 border-t border-gray-300">
                <h2 className="text-sm font-bold text-gray-700 mb-3">Gabarito</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {questoesOrdenadas.map((q, i) => (
                    <span key={q.id} className="text-sm text-gray-700">
                      <span className="font-medium">{i + 1}.</span> {q.gabarito}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
