"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    const res = await fetch("/api/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(data.erro ?? "Erro ao criar conta.");
    } else {
      router.push("/login?cadastro=ok");
    }
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8"
      style={{ background: "#162d45", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
    >
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#4da6ff" }}>
          FDX Preparatório
        </p>
        <h1 className="text-3xl font-bold text-white">FDX IQ</h1>
        <p className="text-sm mt-1" style={{ color: "#7a9bb5" }}>Crie sua conta gratuita</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a9bb5" }}>
            Nome completo
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "#1e3a55", color: "#c8d6e5", border: "1px solid #2a4f72" }}
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a9bb5" }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "#1e3a55", color: "#c8d6e5", border: "1px solid #2a4f72" }}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a9bb5" }}>
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "#1e3a55", color: "#c8d6e5", border: "1px solid #2a4f72" }}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#7a9bb5" }}>
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            required
            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "#1e3a55", color: "#c8d6e5", border: "1px solid #2a4f72" }}
            placeholder="••••••••"
          />
        </div>

        {erro && (
          <p className="text-sm text-red-400 text-center">{erro}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
          style={{ background: "#4da6ff", color: "#0f2137" }}
        >
          {carregando ? "Criando conta..." : "Criar conta grátis"}
        </button>
      </form>

      <p className="text-center text-xs mt-4" style={{ color: "#4a6a85" }}>
        Ao se cadastrar você concorda com os nossos termos de uso.
      </p>

      <p className="text-center text-sm mt-4" style={{ color: "#4a6a85" }}>
        Já tem conta?{" "}
        <a href="/login" className="font-medium" style={{ color: "#4da6ff" }}>
          Entrar
        </a>
      </p>
    </div>
  );
}
