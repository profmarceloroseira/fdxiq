import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario || !usuario.senhaHash || !usuario.ativo) return null;

        const senhaValida = await bcrypt.compare(credentials.password, usuario.senhaHash);
        if (!senhaValida) return null;

        return {
          id: String(usuario.id),
          name: usuario.nome,
          email: usuario.email,
          papel: usuario.papel,
          plano: usuario.plano,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.papel = (user as any).papel;
        token.plano = (user as any).plano;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).papel = token.papel;
        (session.user as any).plano = token.plano;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
