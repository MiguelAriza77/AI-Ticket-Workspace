import { Pool, QueryResultRow } from "pg";

// Reutilizamos un único pool en toda la app. En desarrollo Next recarga los
// módulos a menudo, así que lo guardamos en globalThis para no abrir un pool
// nuevo en cada recarga en caliente.
const globalForPool = globalThis as unknown as { pool?: Pool };

export const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

export function query<T extends QueryResultRow = any>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params as any[]);
}
