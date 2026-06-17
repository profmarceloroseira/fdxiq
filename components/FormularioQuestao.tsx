"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MathText from "./MathText";

interface Alternativa {
  letra: string;
  texto: string;
  correta: boolean;
}

interface Subtema {
  id: number;
  nome: string;
  tema: { nome: string; disciplina: { nome: string } };
}

interface QuestaoInicial {
  id?: number;
  enunciado?: string;
  tipo?: string;
  dificuldade?: string;
  secao?: string;
  fonte?: string;
  anoFonte?: number | null;
  resolucao?: string;
  gabarito?: string;
  subtemaId?: number;
  alternativas?: Alternativa[];
}

const LETRAS = ["A", "B", "C", "D", "E"];

export default function FormularioQuestao({ inicial }: { inicial?: QuestaoInicial }) {
  const router = useRouter();
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    enunciado: inicial?.enunciado ?? "",
    tipo: inicial?.tipo ?? "multipla_escolha",
    dificuldade: inicial?.dificuldade ?? "medio",
    secao: inicial?.secao ?? "problema",
    fonte: inicial?.fonte ?? "FDX Preparatório ANPAD",
    anoFonte: inicial?.anoFonte?.toString() ?? "2022",
    resolucao: inicial?.resolucao ?? "",
    gabarito: inicial?.gabarito ?? "A",
    subtemaId: inicial?.subtemaId?.toString() ?? "",
  });

  const [alternativas, setAlternativas] = useState<Alternativa[]>(
    inicial?.alternativas ??
      LETRAS.map((l) => ({ letra: l, texto: "", correta: l === "A" }))
  );

  useEffect(() => {
    fetch("/api/subtemas").then((r) => r.json()).then(setSubtemas);
  }, []);

  const setAlt = (i: number, campo: keyof Alternativa, valor: string | boolean) => {
    setAlternativas((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a))
    );
  };

  const marcarCorreta = (letra: string) => {
    setAlternativas((prev) => prev.map((a) => ({ ...a, correta: a.letra === letra })));
    setForm((f) => ({ ...f, gabarito: letra }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    const payload = { ...form, alternativas };
    const url = inicial?.id ? `/api/admin/questoes/${inicial.id}` : "/api/admin/questoes";
    const method = inicial?.id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error ?? "Erro ao salvar.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Enunciado */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Enunciado *</label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-xs text-blue-600 hover:underline"
          >
            {preview ? "Editar" : "Preview LaTeX"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-[80px] p-3 border border-blue-200 rounded-lg bg-blue-50 text-sm text-gray-800">
            <MathText text={form.enunciado} />
          </div>
        ) : (
          <textarea
            value={form.enunciado}
            onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))}
            rows={4}
            required
            placeholder="Use $...$  para LaTeX inline e $$...$$ para bloco"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
          />
        )}
        <p className="text-xs text-gray-400 mt-1">Use <code>$...$</code> para fórmulas inline e <code>$$...$$</code> para blocos.</p>
      </div>

      {/* Metadados */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Subtema *</label>
          <select
            value={form.subtemaId}
            onChange={(e) => setForm((f) => ({ ...f, subtemaId: e.target.value }))}
            required
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Selecione...</option>
            {subtemas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tema.nome} › {s.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Dificuldade</label>
          <select
            value={form.dificuldade}
            onChange={(e) => setForm((f) => ({ ...f, dificuldade: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Seção</label>
          <select
            value={form.secao}
            onChange={(e) => setForm((f) => ({ ...f, secao: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="problema">Problema</option>
            <option value="fixacao">Fixação</option>
            <option value="simulado">Simulado</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Fonte</label>
          <input
            value={form.fonte}
            onChange={(e) => setForm((f) => ({ ...f, fonte: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Ano</label>
          <input
            type="number"
            value={form.anoFonte}
            onChange={(e) => setForm((f) => ({ ...f, anoFonte: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Alternativas */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Alternativas — marque a correta
        </label>
        <div className="space-y-2">
          {alternativas.map((alt, i) => (
            <div key={alt.letra} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => marcarCorreta(alt.letra)}
                className={`mt-1.5 w-7 h-7 flex-shrink-0 rounded-full text-xs font-bold border-2 transition-colors ${
                  alt.correta
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 text-gray-500 hover:border-green-400"
                }`}
              >
                {alt.letra}
              </button>
              <textarea
                value={alt.texto}
                onChange={(e) => setAlt(i, "texto", e.target.value)}
                rows={1}
                placeholder={`Alternativa ${alt.letra} (aceita LaTeX)`}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono resize-none"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Clique na letra para marcar a alternativa correta (atual: <strong>{form.gabarito}</strong>).</p>
      </div>

      {/* Resolução */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Resolução / Justificativa</label>
        <textarea
          value={form.resolucao}
          onChange={(e) => setForm((f) => ({ ...f, resolucao: e.target.value }))}
          rows={4}
          placeholder="Explique o raciocínio da solução (aceita LaTeX)"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
        />
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {salvando ? "Salvando..." : inicial?.id ? "Salvar alterações" : "Criar questão"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
