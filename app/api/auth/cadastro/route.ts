import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { nome, email, senha } = await req.json();

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Preencha todos os campos." }, { status: 400 });
  }

  if (senha.length < 6) {
    return NextResponse.json({ erro: "A senha deve ter ao menos 6 caracteres." }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "Este e-mail já está cadastrado." }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  await prisma.usuario.create({
    data: { nome, email, senhaHash, papel: "candidato", plano: "free" },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
