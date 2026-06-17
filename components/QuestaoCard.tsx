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

const COR_DIFICULDADE: Record<string, string> = {
  facil: "bg-green-100 text-green-800",
  medio: "bg-yellow-100 text-yellow-800",
  dificil: "bg-red-100 text-red-800",
};

const LABEL_DIFICULDADE: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const LABEL_SECAO: Record<string, string> = {
  problema: "Problema",
  fixacao: "Fixação",
  simulado: "Simulado",
};

export default function QuestaoCard({ questao, selecionada, onToggleSelecao, mostrarGabarito }: Props) {
  const [expandida, setExpandida] = useState(false);

  return (
    <div className={`border rounded-xl p-4 bg-white shadow-sm transition-all ${selecionada ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        {onToggleSelecao && (
          <input
            type="checkbox"
            checked={!!selecionada}
            onChange={() => onToggleSelecao(questao.id)}
            className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">Q{questao.id}</span>
            {questao.subtema && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {questao.subtema.tema?.nome} › {questao.subtema.nome}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COR_DIFICULDADE[questao.dificuldade] ?? ""}`}>
              {LABEL_DIFICULDADE[questao.dificuldade] ?? questao.dificuldade}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {LABEL_SECAO[questao.secao] ?? questao.secao}
            </span>
          </div>

          <p className="text-gray-800 text-sm leading-relaxed mb-3">
            <MathText text={questao.enunciado} />
          </p>

          <div className="space-y-1 mb-3">
            {questao.alternativas.map((alt) => (
              <div
                key={alt.id}
                className={`flex gap-2 text-sm px-2 py-1 rounded ${
                  mostrarGabarito && alt.correta
                    ? "bg-green-50 text-green-800 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <span className="font-medium w-5 flex-shrink-0">{alt.letra})</span>
                <MathText text={alt.texto} />
              </div>
            ))}
          </div>

          {questao.resolucao && (
            <button
              onClick={() => setExpandida(!expandida)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {expandida ? "▲ Ocultar resolução" : "▼ Ver resolução"}
            </button>
          )}

          {expandida && questao.resolucao && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 border border-blue-100">
              <span className="font-semibold text-blue-700">Resolução: </span>
              <MathText text={questao.resolucao} />
            </div>
          )}

          {questao.fonte && (
            <p className="mt-2 text-xs text-gray-400">
              Fonte: {questao.fonte} {questao.anoFonte ? `(${questao.anoFonte})` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
