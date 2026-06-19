import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { query, withTransaction } from "../config/database";

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function bootstrapMigrationHistory(files: string[]): Promise<void> {
  const rows = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM schema_migrations"
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return;
  }

  const tableRows = await query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('users', 'account_opening_documents', 'document_review_history')
  `);
  const tables = new Set(tableRows.map((row) => row.table_name));

  if (!tables.has("users")) {
    return;
  }

  const statusColumn = tables.has("account_opening_documents")
    ? await query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'account_opening_documents'
            AND column_name = 'status'
        ) AS exists
      `)
    : [{ exists: false }];

  const alreadyApplied = files.filter((file) => {
    if (!tables.has("account_opening_documents")) {
      return file < "005_create_account_opening_documents.sql";
    }

    if (!statusColumn[0]?.exists) {
      return file < "008_document_approval_and_roles.sql";
    }

    return true;
  });

  for (const file of alreadyApplied) {
    await query(
      "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
      [file]
    );
  }

  if (alreadyApplied.length > 0) {
    console.log(
      `Marked ${alreadyApplied.length} existing migration(s) as already applied.`
    );
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  await ensureMigrationsTable();

  const migrationsDir = path.join(__dirname, "../db/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await bootstrapMigrationHistory(files);

  const appliedRows = await query<{ filename: string }>(
    "SELECT filename FROM schema_migrations ORDER BY filename"
  );
  const applied = new Set(appliedRows.map((row) => row.filename));

  let appliedCount = 0;

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

    await withTransaction(async (executor) => {
      await executor.query(sql);
      await executor.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file]
      );
    });

    console.log(`Applied ${file}`);
    appliedCount += 1;
  }

  if (appliedCount === 0) {
    console.log("No pending migrations.");
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
