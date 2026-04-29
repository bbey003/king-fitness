import mysql from 'mysql2/promise';
import { mockDb, type MockDbResult } from './mock-db';

let pool: mysql.Pool | null = null;
let useMock = false;

function envNumber(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildPool(): mysql.Pool | null {
  try {
    if (
      !process.env.DB_HOST ||
      !process.env.DB_USER ||
      !process.env.DB_NAME
    ) {
      return null;
    }
    const p = mysql.createPool({
      host: process.env.DB_HOST,
      port: envNumber('DB_PORT', 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: 'Z',
    });
    return p;
  } catch {
    return null;
  }
}

export async function getPool(): Promise<mysql.Pool | null> {
  if (useMock) return null;
  if (pool) return pool;
  pool = buildPool();
  if (!pool) {
    useMock = true;
    return null;
  }
  // verify connection
  try {
    const conn = await pool.getConnection();
    conn.release();
    return pool;
  } catch {
    useMock = true;
    pool = null;
    return null;
  }
}

export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = await getPool();
  if (!p) {
    const result = mockDb.query<T>(sql, params);
    return result;
  }
  const [rows] = await p.execute(sql, params as mysql.ExecuteValues);
  return rows as T[];
}

export async function execute(
  sql: string,
  params: unknown[] = []
): Promise<{ insertId: number | string; affectedRows: number }> {
  const p = await getPool();
  if (!p) {
    const r: MockDbResult = mockDb.execute(sql, params);
    return r;
  }
  const [result] = await p.execute(sql, params as mysql.ExecuteValues);
  const r = result as mysql.ResultSetHeader;
  return { insertId: r.insertId, affectedRows: r.affectedRows };
}

export function isMockMode(): boolean {
  return useMock || !pool;
}
