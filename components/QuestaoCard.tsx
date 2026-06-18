"use client";

import { useState } from "react";
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

interface Props {
  questao: Questao;
  selecionada?: boolean;
  onToggleSelecao?: (id: number) => void;
  mostrarGabarito?: boolean;
}

const DIFICULDADE_CONFIG: Record<string, { cor: string; label: string; badge: string; badgeText: string }> = {
  facil:   { cor: "#22c55e", label: "Fácil",   badge: "#dcfce7", badgeText: "#166534" },
  medio:   { cor: "#f59e0b", label: "Médio",   badge: "#fef3c7", badgeText: "#92400e" },
  dificil: { cor: "#ef4444", label: "Difícil", badge: "#fee2e2", badgeText: "#991b1b" },
};

const LABEL_SECAO: Record<string, string> = {
  problema: "Problema",
  fixacao: "Fixação",
  simulado: "Simulado",
};

export default function QuestaoCard({ questao, selecionada, onToggleSelecao, mostrarGabarito }: Props) {
  const [expandida, setExpandida] = useState(false);

  const cfg = DIFICULDADE_CONFIG[questao.dificuldade] ?? { cor: "#94a3b8", label: questao.dificuldade, badge: "#f1f5f9", badgeText: "#475569" };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden transition-all"
      style={{
        borderLeft: `4px solid ${cfg.cor}`,
        boxShadow: selecionada
          ? "0 0 0 2px #3b82f6, 0 1px 3px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {onToggleSelecao && (
            <input
              type="checkbox"
              checked={!!selecionada}
              onChange={() => onToggleSelecao(questao.id)}
              className="mt-1 h-4 w-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Cabeçalho do card */}
            <div className="flex items-center flex-wrap gap-2 mb-2.5">
              <span className="text-xs font-mono font-semibold text-gray-400">Q{String(questao.id).padStart(3, "0")}</span>

              {questao.subtema && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "#eff6ff", color: "#1d4ed8" }}
                >
                  {questao.subtema.tema?.nome} › {questao.subtema.nome}
                </span>
              )}

              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: cfg.badge, color: cfg.badgeText }}
              >
                {cfg.label}
              </span>

              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#f1f5f9", color: "#64748b" }}
              >
                {LABEL_SECAO[questao.secao] ?? questao.secao}
              </span>
            </div>

            {/* Enunciado */}
            <div className="text-gray-800 text-sm leading-relaxed mb-3">
              <MathText text={questao.enunciado} />
            </div>

            {/* Alternativas */}
            {questao.alternativas.length > 0 && (
              <div className="space-y-1 mb-3">
                {questao.alternativas.map((alt) => {
                  const correta = mostrarGabarito && alt.correta;
                  return (
                    <div
                      key={alt.id}
                      className="flex gap-2 text-sm px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: correta ? "#f0fdf4" : "transparent",
                        color: correta ? "#15803d" : "#374151",
                        fontWeight: correta ? 600 : 400,
                      }}
                    >
                      <span
                        className="font-bold flex-shrink-0 w-5"
                        style={{ color: correta ? "#15803d" : "#94a3b8" }}
                      >
                        {alt.letra})
                      </span>
                      <MathText text={alt.texto} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resolução */}
            {questao.resolucao && (
              <>
                <button
                  onClick={() => setExpandida(!expandida)}
                  className="text-xs font-medium transition-colors flex items-center gap-1"
                  style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <span>{expandida ? "▲" : "▼"}</span>
                  <span>{expandida ? "Ocultar resolução" : "Ver resolução"}</span>
                </button>

                {expandida && (
                  <div
                    className="mt-2.5 p-3 rounded-lg text-sm leading-relaxed"
                    style={{ background: "#eff6ff", borderLeft: "3px solid #3b82f6", color: "#374151" }}
                  >
                    <span className="font-semibold text-blue-700">Resolução: </span>
                    <MathText text={questao.resolucao} />
                  </div>
                )}
              </>
            )}

            {/* Fonte */}
            {questao.fonte && (
              <p className="mt-2 text-xs" style={{ color: "#94a3b8" }}>
                {questao.fonte}{questao.anoFonte ? ` (${questao.anoFonte})` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
