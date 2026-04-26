/**
 * Run with: npm run db:migrate
 * Requires DB_* env vars to be set in your shell or via Node's built-in
 *   `--env-file=.env.local` flag. If not set, exits gracefully.
 *
 * If you want auto-loading from .env.local without the flag, install dotenv
 * and add `import 'dotenv/config'` at the top.
 */
import mysql from 'mysql2/promise';
import { MIGRATIONS } from '../lib/migrations';

async function main(): Promise<void> {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.log('[migrate] DB env vars not set — skipping (mock mode active).');
    process.exit(0);
  }
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('[migrate] connected.');
  for (const m of MIGRATIONS) {
    console.log(`  · running ${m.name}`);
    await conn.query(m.sql);
  }
  await conn.end();
  console.log('[migrate] done.');
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
