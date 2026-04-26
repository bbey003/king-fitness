/**
 * In-memory mock database for development without MySQL.
 *
 * This is a pragmatic, query-pattern-matching mock. It does NOT execute SQL.
 * Instead, all data access in the app should prefer the typed repository
 * functions in lib/repos/*. Those repositories use this mock when no MySQL
 * connection is available, and use real SQL when one is.
 *
 * The functions exported here support a tiny subset of SQL (used only in
 * scripts/migrate.ts to call CREATE TABLE statements which we treat as no-ops).
 */
import { randomUUID } from 'crypto';

export interface MockDbResult {
  insertId: number | string;
  affectedRows: number;
}

export interface MockTableRow {
  [key: string]: unknown;
}

class MockDatabase {
  private tables: Map<string, MockTableRow[]> = new Map();

  constructor() {
    this.initTables();
  }

  private initTables(): void {
    const tableNames = [
      'users',
      'sessions',
      'password_reset_tokens',
      'audit_logs',
      'newsletter_subscribers',
      'services',
      'availability_rules',
      'availability_overrides',
      'booking_holds',
      'bookings',
      'products',
      'product_variants',
      'orders',
      'order_items',
      'cart_items',
      'reviews',
      'blog_posts',
      'blog_tags',
      'payment_intents',
      'transactions',
      'refunds',
      'payment_methods',
      'admin_roles',
      'admin_notes',
      'verifications',
      'verification_badges',
      'id_documents',
    ];
    for (const name of tableNames) {
      this.tables.set(name, []);
    }
  }

  getTable(name: string): MockTableRow[] {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name) as MockTableRow[];
  }

  insert(table: string, row: MockTableRow): MockTableRow {
    const t = this.getTable(table);
    const withId: MockTableRow = { ...row };
    if (!withId.id) withId.id = randomUUID();
    if (!withId.created_at) withId.created_at = new Date().toISOString();
    t.push(withId);
    return withId;
  }

  findAll(table: string): MockTableRow[] {
    return [...this.getTable(table)];
  }

  findWhere(
    table: string,
    predicate: (row: MockTableRow) => boolean
  ): MockTableRow[] {
    return this.getTable(table).filter(predicate);
  }

  findOne(
    table: string,
    predicate: (row: MockTableRow) => boolean
  ): MockTableRow | null {
    return this.getTable(table).find(predicate) ?? null;
  }

  update(
    table: string,
    predicate: (row: MockTableRow) => boolean,
    patch: MockTableRow
  ): number {
    const t = this.getTable(table);
    let count = 0;
    for (let i = 0; i < t.length; i++) {
      const row = t[i];
      if (row && predicate(row)) {
        t[i] = { ...row, ...patch, updated_at: new Date().toISOString() };
        count++;
      }
    }
    return count;
  }

  remove(
    table: string,
    predicate: (row: MockTableRow) => boolean
  ): number {
    const t = this.getTable(table);
    const before = t.length;
    const remaining = t.filter((r) => !predicate(r));
    this.tables.set(table, remaining);
    return before - remaining.length;
  }

  query<T>(_sql: string, _params: unknown[]): T[] {
    // Raw SQL queries are not implemented in mock mode.
    // Repos detect mock mode and use the typed methods above instead.
    return [] as T[];
  }

  execute(_sql: string, _params: unknown[]): MockDbResult {
    return { insertId: 0, affectedRows: 0 };
  }
}

// Module-level singleton — survives across requests within a single process.
declare global {
  // eslint-disable-next-line no-var
  var __mockDb: MockDatabase | undefined;
}

export const mockDb: MockDatabase =
  globalThis.__mockDb ?? (globalThis.__mockDb = new MockDatabase());
