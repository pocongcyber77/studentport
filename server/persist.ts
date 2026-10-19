import pg from 'pg';

const STATE_ID = 'default';

let pool: pg.Pool | null = null;

export function isPostgresEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getPool(): Promise<pg.Pool | null> {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function ensureSchema(): Promise<void> {
  const db = await getPool();
  if (!db) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function loadState(): Promise<unknown | null> {
  const db = await getPool();
  if (!db) return null;
  await ensureSchema();
  const result = await db.query<{ data: unknown }>(
    'SELECT data FROM app_state WHERE id = $1',
    [STATE_ID]
  );
  return result.rows[0]?.data ?? null;
}

export async function saveState(data: unknown): Promise<void> {
  const db = await getPool();
  if (!db) return;
  await ensureSchema();
  await db.query(
    `INSERT INTO app_state (id, data, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [STATE_ID, JSON.stringify(data)]
  );
}

export async function pingDatabase(): Promise<boolean> {
  const db = await getPool();
  if (!db) return false;
  await db.query('SELECT 1');
  return true;
}
