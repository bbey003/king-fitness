import { isMockMode, execute, query } from '../db';
import { mockDb, type MockTableRow } from '../mock-db';
import { randomUUID, randomBytes } from 'crypto';
import type { SessionRow } from '../types';

function toSession(r: MockTableRow): SessionRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    token: String(r.token),
    expires_at: String(r.expires_at),
    created_at: String(r.created_at),
  };
}

export const sessionRepo = {
  async create(userId: string, ttlDays = 30): Promise<SessionRow> {
    const id = randomUUID();
    const token = randomBytes(48).toString('hex');
    const expires_at = new Date(
      Date.now() + ttlDays * 24 * 60 * 60 * 1000
    ).toISOString();
    if (isMockMode()) {
      const row = mockDb.insert('sessions', {
        id,
        user_id: userId,
        token,
        expires_at,
      });
      return toSession(row);
    }
    await execute(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [id, userId, token, expires_at]
    );
    return {
      id,
      user_id: userId,
      token,
      expires_at,
      created_at: new Date().toISOString(),
    };
  },

  async findByToken(token: string): Promise<SessionRow | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('sessions', (s) => s.token === token);
      if (!r) return null;
      const sess = toSession(r);
      if (new Date(sess.expires_at) < new Date()) return null;
      return sess;
    }
    const rows = await query<MockTableRow>(
      `SELECT * FROM sessions WHERE token = ? AND expires_at > NOW() LIMIT 1`,
      [token]
    );
    return rows[0] ? toSession(rows[0]) : null;
  },

  async deleteByToken(token: string): Promise<void> {
    if (isMockMode()) {
      mockDb.remove('sessions', (s) => s.token === token);
      return;
    }
    await execute(`DELETE FROM sessions WHERE token = ?`, [token]);
  },

  async deleteByUserId(userId: string): Promise<void> {
    if (isMockMode()) {
      mockDb.remove('sessions', (s) => s.user_id === userId);
      return;
    }
    await execute(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
  },
};
