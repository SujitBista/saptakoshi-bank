import { Pool, QueryResultRow } from "pg";

export interface DbExecutor {
  query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]>;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

export async function withTransaction<T>(
  callback: (executor: DbExecutor) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const executor: DbExecutor = {
      async query<U extends QueryResultRow>(
        sql: string,
        params?: unknown[]
      ): Promise<U[]> {
        const result = await client.query<U>(sql, params);
        return result.rows;
      },
    };

    const result = await callback(executor);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export { pool };
