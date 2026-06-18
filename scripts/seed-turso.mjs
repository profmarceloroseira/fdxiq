import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("Defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN");
  process.exit(1);
}

const local = createClient({ url: "file:dev.db" });
const remote = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// 1. Aplica o schema via migration SQL
const migrationPath = resolve(__dirname, "../prisma/migrations");
const migrations = readdirSync(migrationPath)
  .filter(f => !f.includes("migration_lock"))
  .sort();

for (const m of migrations) {
  const sqlFile = resolve(migrationPath, m, "migration.sql");
  const sql = readFileSync(sqlFile, "utf8");
  const statements = sql.split(";").map(s => s.trim()).filter(Boolean);
  console.log(`Aplicando migration: ${m}`);
  for (const stmt of statements) {
    try {
      await remote.execute(stmt);
    } catch (e) {
      if (!e.message.includes("already exists")) {
        console.warn(`  Aviso: ${e.message.slice(0, 100)}`);
      }
    }
  }
}
console.log("Schema aplicado!\n");

// 2. Copia os dados tabela por tabela
const tables = ["Disciplina", "Tema", "Subtema", "Questao", "Alternativa", "Tag", "TagQuestao"];

for (const table of tables) {
  const result = await local.execute(`SELECT * FROM "${table}"`);
  if (result.rows.length === 0) {
    console.log(`${table}: vazio, pulando`);
    continue;
  }

  const cols = result.columns;
  let count = 0;

  for (const row of result.rows) {
    // Monta SQL com parâmetros nomeados (:col0, :col1, ...)
    const namedCols = cols.map((_, i) => `:p${i}`).join(", ");
    const args = Object.fromEntries(cols.map((_, i) => [`p${i}`, row[i] ?? null]));

    try {
      await remote.execute({
        sql: `INSERT OR IGNORE INTO "${table}" (${cols.join(", ")}) VALUES (${namedCols})`,
        args,
      });
      count++;
    } catch (e) {
      console.warn(`  Erro em ${table} row ${count}: ${e.message.slice(0, 100)}`);
    }
  }
  console.log(`${table}: ${count}/${result.rows.length} registros copiados`);
}

console.log("\nConcluido!");
process.exit(0);
