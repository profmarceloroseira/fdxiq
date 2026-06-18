"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const res = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
    });

    setCarregando(false);

    if (res?.error) {
      setErro("E-mail ou senha incorretos.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8"
      style={{ background: "#162d45", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#4da6ff" }}>
          FDX Preparatório
        </p>
        <h1 className="text-3xl font-bold text-white">FDX IQ</h1>
        <p className="text-sm mt-1" style={{ color: "#7a9bb5" }}>Banco de Questões ANPAD</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "#4a6a85" }}>
        Não tem conta?{" "}
        <a href="/cadastro" className="font-medium" style={{ color: "#4da6ff" }}>
          Cadastre-se grátis
        </a>
      </p>
    </div>
  );
}
