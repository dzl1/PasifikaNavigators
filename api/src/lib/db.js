import pg from 'pg'

let pool

// Azure Database for PostgreSQL requires TLS. Set DATABASE_SSL=false only for
// a local Postgres during development.
export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.')
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 30000,
    })
  }
  return pool
}

export async function query(text, params = []) {
  return getPool().query(text, params)
}
