/*
  Warnings:

  - Added the required column `atualizadoEm` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Sessao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'pratica',
    "disciplinaId" INTEGER,
    "iniciadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" DATETIME,
    CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "alternativaId" INTEGER,
    "sessaoId" INTEGER,
    "correta" BOOLEAN NOT NULL,
    "tempoSegundos" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resposta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resposta_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Resposta_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "Alternativa" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Resposta_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Disciplina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Disciplina" ("id", "nome") SELECT "id", "nome" FROM "Disciplina";
DROP TABLE "Disciplina";
ALTER TABLE "new_Disciplina" RENAME TO "Disciplina";
CREATE UNIQUE INDEX "Disciplina_nome_key" ON "Disciplina"("nome");
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT,
    "papel" TEXT NOT NULL DEFAULT 'candidato',
    "plano" TEXT NOT NULL DEFAULT 'free',
    "planoExpiraEm" DATETIME,
    "stripeCustomerId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Usuario" ("criadoEm", "email", "id", "nome", "papel") SELECT "criadoEm", "email", "id", "nome", "papel" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
