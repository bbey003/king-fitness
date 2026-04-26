import { isMockMode, query, execute } from '../db';
import { mockDb, type MockTableRow } from '../mock-db';
import { randomUUID } from 'crypto';
import type { User, PublicUser, UserRole } from '../types';

function toUser(row: MockTableRow): User {
  return {
    id: String(row.id),
    email: String(row.email),
    password_hash: String(row.password_hash ?? ''),
    display_name: String(row.display_name ?? ''),
    avatar_url: row.avatar_url ? String(row.avatar_url) : null,
    role: (row.role as UserRole) ?? 'user',
    status: (row.status as 'active' | 'suspended') ?? 'active',
    email_verified_at: row.email_verified_at ? String(row.email_verified_at) : null,
    timezone: String(row.timezone ?? 'UTC'),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function toPublicUser(u: User): PublicUser {
  const { password_hash: _omit, ...rest } = u;
  return rest;
}

export const userRepo = {
  async findByEmail(email: string): Promise<User | null> {
    if (isMockMode()) {
      const row = mockDb.findOne('users', (r) => r.email === email);
      return row ? toUser(row) : null;
    }
    const rows = await query<MockTableRow>(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] ? toUser(rows[0]) : null;
  },

  async findById(id: string): Promise<User | null> {
    if (isMockMode()) {
      const row = mockDb.findOne('users', (r) => r.id === id);
      return row ? toUser(row) : null;
    }
    const rows = await query<MockTableRow>(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ? toUser(rows[0]) : null;
  },

  async listAll(opts?: {
    search?: string;
    status?: 'active' | 'suspended';
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;
    if (isMockMode()) {
      let rows = mockDb.findAll('users');
      if (opts?.search) {
        const q = opts.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            String(r.email).toLowerCase().includes(q) ||
            String(r.display_name).toLowerCase().includes(q)
        );
      }
      if (opts?.status) {
        rows = rows.filter((r) => r.status === opts.status);
      }
      return rows.slice(offset, offset + limit).map(toUser);
    }
    const rows = await query<MockTableRow>(
      `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map(toUser);
  },

  async create(input: {
    email: string;
    password_hash: string;
    display_name: string;
    role?: UserRole;
  }): Promise<User> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const row: MockTableRow = {
      id,
      email: input.email,
      password_hash: input.password_hash,
      display_name: input.display_name,
      avatar_url: null,
      role: input.role ?? 'user',
      status: 'active',
      email_verified_at: null,
      timezone: 'UTC',
      created_at: now,
      updated_at: now,
    };
    if (isMockMode()) {
      mockDb.insert('users', row);
      return toUser(row);
    }
    await execute(
      `INSERT INTO users (id, email, password_hash, display_name, role, status, timezone)
       VALUES (?, ?, ?, ?, ?, 'active', 'UTC')`,
      [id, input.email, input.password_hash, input.display_name, input.role ?? 'user']
    );
    return toUser(row);
  },

  async updateStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
    if (isMockMode()) {
      mockDb.update('users', (r) => r.id === id, { status });
      return;
    }
    await execute(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
  },

  async updatePassword(id: string, password_hash: string): Promise<void> {
    if (isMockMode()) {
      mockDb.update('users', (r) => r.id === id, { password_hash });
      return;
    }
    await execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      password_hash,
      id,
    ]);
  },

  async count(): Promise<number> {
    if (isMockMode()) return mockDb.findAll('users').length;
    const rows = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM users`);
    return rows[0]?.c ?? 0;
  },

  async anonymize(id: string): Promise<void> {
    const anonEmail = `deleted-${id.slice(0, 8)}@deleted.local`;
    if (isMockMode()) {
      mockDb.update('users', (r) => r.id === id, {
        email: anonEmail,
        password_hash: '',
        display_name: 'Deleted user',
        avatar_url: null,
        status: 'suspended',
      });
      return;
    }
    await execute(
      `UPDATE users SET email = ?, password_hash = '', display_name = ?, avatar_url = NULL, status = 'suspended' WHERE id = ?`,
      [anonEmail, 'Deleted user', id]
    );
  },
};
