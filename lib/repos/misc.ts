import { isMockMode } from '../db';
import { mockDb, type MockTableRow } from '../mock-db';
import { randomUUID } from 'crypto';
import type {
  PaymentIntentRow,
  Transaction,
  AuditLog,
  NewsletterSubscriber,
  Verification,
  VerificationStatus,
  VerificationType,
} from '../types';

// ───────── payments ─────────
function toIntent(r: MockTableRow): PaymentIntentRow {
  return {
    id: String(r.id),
    stripe_payment_intent_id: r.stripe_payment_intent_id
      ? String(r.stripe_payment_intent_id)
      : null,
    user_id: String(r.user_id),
    amount_cents: Number(r.amount_cents),
    currency: String(r.currency ?? 'usd'),
    status: String(r.status),
    metadata: (r.metadata as Record<string, unknown> | null) ?? null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at ?? r.created_at),
  };
}

function toTxn(r: MockTableRow): Transaction {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    payment_intent_id: r.payment_intent_id ? String(r.payment_intent_id) : null,
    type: r.type as 'charge' | 'refund',
    amount_cents: Number(r.amount_cents),
    fee_cents: Number(r.fee_cents ?? 0),
    net_cents: Number(r.net_cents),
    description: r.description ? String(r.description) : null,
    stripe_charge_id: r.stripe_charge_id ? String(r.stripe_charge_id) : null,
    stripe_refund_id: r.stripe_refund_id ? String(r.stripe_refund_id) : null,
    created_at: String(r.created_at),
  };
}

export const paymentRepo = {
  async createIntent(input: {
    stripe_payment_intent_id?: string | null;
    user_id: string;
    amount_cents: number;
    currency?: string;
    status: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentIntentRow> {
    const id = randomUUID();
    const row: MockTableRow = {
      id,
      stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
      user_id: input.user_id,
      amount_cents: input.amount_cents,
      currency: input.currency ?? 'usd',
      status: input.status,
      metadata: input.metadata ?? null,
    };
    if (isMockMode()) {
      mockDb.insert('payment_intents', row);
    }
    return toIntent(row);
  },

  async findByStripeId(stripeId: string): Promise<PaymentIntentRow | null> {
    if (isMockMode()) {
      const r = mockDb.findOne(
        'payment_intents',
        (p) => p.stripe_payment_intent_id === stripeId
      );
      return r ? toIntent(r) : null;
    }
    return null;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    if (isMockMode()) {
      mockDb.update('payment_intents', (p) => p.id === id, { status });
    }
  },

  async createTransaction(input: {
    user_id: string;
    payment_intent_id?: string | null;
    type: 'charge' | 'refund';
    amount_cents: number;
    fee_cents?: number;
    description?: string;
    stripe_charge_id?: string | null;
    stripe_refund_id?: string | null;
  }): Promise<Transaction> {
    const id = randomUUID();
    const fee = input.fee_cents ?? 0;
    const row: MockTableRow = {
      id,
      user_id: input.user_id,
      payment_intent_id: input.payment_intent_id ?? null,
      type: input.type,
      amount_cents: input.amount_cents,
      fee_cents: fee,
      net_cents: input.amount_cents - fee,
      description: input.description ?? null,
      stripe_charge_id: input.stripe_charge_id ?? null,
      stripe_refund_id: input.stripe_refund_id ?? null,
    };
    if (isMockMode()) {
      mockDb.insert('transactions', row);
    }
    return toTxn(row);
  },

  async listTransactionsForUser(userId: string): Promise<Transaction[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('transactions')
        .filter((t) => t.user_id === userId)
        .sort(
          (a, b) =>
            new Date(String(b.created_at)).getTime() -
            new Date(String(a.created_at)).getTime()
        )
        .map(toTxn);
    }
    return [];
  },

  async listAllTransactions(): Promise<Transaction[]> {
    if (isMockMode()) {
      return mockDb.findAll('transactions').map(toTxn);
    }
    return [];
  },
};

// ───────── audit ─────────
export const auditRepo = {
  async log(input: {
    actor_id?: string | null;
    action: string;
    target_type?: string;
    target_id?: string;
    before_state?: Record<string, unknown>;
    after_state?: Record<string, unknown>;
    ip_address?: string;
  }): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      id,
      actor_id: input.actor_id ?? null,
      action: input.action,
      target_type: input.target_type ?? null,
      target_id: input.target_id ?? null,
      before_state: input.before_state ?? null,
      after_state: input.after_state ?? null,
      ip_address: input.ip_address ?? null,
      created_at: new Date().toISOString(),
    };
    if (isMockMode()) {
      mockDb.insert('audit_logs', { ...log });
    }
    return log;
  },

  async list(opts?: {
    actor_id?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    const limit = opts?.limit ?? 100;
    if (isMockMode()) {
      let rows = mockDb.findAll('audit_logs');
      if (opts?.actor_id) rows = rows.filter((r) => r.actor_id === opts.actor_id);
      if (opts?.action) rows = rows.filter((r) => r.action === opts.action);
      return rows
        .sort(
          (a, b) =>
            new Date(String(b.created_at)).getTime() -
            new Date(String(a.created_at)).getTime()
        )
        .slice(0, limit)
        .map((r) => ({
          id: String(r.id),
          actor_id: r.actor_id ? String(r.actor_id) : null,
          action: String(r.action),
          target_type: r.target_type ? String(r.target_type) : null,
          target_id: r.target_id ? String(r.target_id) : null,
          before_state: (r.before_state as Record<string, unknown> | null) ?? null,
          after_state: (r.after_state as Record<string, unknown> | null) ?? null,
          ip_address: r.ip_address ? String(r.ip_address) : null,
          created_at: String(r.created_at),
        }));
    }
    return [];
  },
};

// ───────── newsletter ─────────
export const newsletterRepo = {
  async subscribe(email: string, ip?: string): Promise<NewsletterSubscriber> {
    if (isMockMode()) {
      const existing = mockDb.findOne(
        'newsletter_subscribers',
        (r) => r.email === email
      );
      if (existing) {
        if (existing.unsubscribed_at) {
          mockDb.update(
            'newsletter_subscribers',
            (r) => r.email === email,
            { unsubscribed_at: null, consented_at: new Date().toISOString() }
          );
        }
        return {
          id: String(existing.id),
          email: String(existing.email),
          consented_at: String(existing.consented_at),
          unsubscribed_at: null,
          ip_address: existing.ip_address ? String(existing.ip_address) : null,
        };
      }
      const row = mockDb.insert('newsletter_subscribers', {
        email,
        consented_at: new Date().toISOString(),
        unsubscribed_at: null,
        ip_address: ip ?? null,
      });
      return {
        id: String(row.id),
        email: String(row.email),
        consented_at: String(row.consented_at),
        unsubscribed_at: null,
        ip_address: ip ?? null,
      };
    }
    return {
      id: randomUUID(),
      email,
      consented_at: new Date().toISOString(),
      unsubscribed_at: null,
      ip_address: ip ?? null,
    };
  },

  async list(): Promise<NewsletterSubscriber[]> {
    if (isMockMode()) {
      return mockDb.findAll('newsletter_subscribers').map((r) => ({
        id: String(r.id),
        email: String(r.email),
        consented_at: String(r.consented_at),
        unsubscribed_at: r.unsubscribed_at ? String(r.unsubscribed_at) : null,
        ip_address: r.ip_address ? String(r.ip_address) : null,
      }));
    }
    return [];
  },
};

// ───────── verifications ─────────
function toVerification(r: MockTableRow): Verification {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    type: r.type as VerificationType,
    status: r.status as VerificationStatus,
    submitted_at: r.submitted_at ? String(r.submitted_at) : null,
    reviewed_at: r.reviewed_at ? String(r.reviewed_at) : null,
    reviewed_by: r.reviewed_by ? String(r.reviewed_by) : null,
    rejection_reason: r.rejection_reason ? String(r.rejection_reason) : null,
    document_type: r.document_type ? String(r.document_type) : null,
    document_urls: Array.isArray(r.document_urls)
      ? (r.document_urls as string[])
      : [],
    expiry_date: r.expiry_date ? String(r.expiry_date) : null,
    metadata: (r.metadata as Record<string, unknown> | null) ?? null,
    created_at: String(r.created_at),
  };
}

export const verificationRepo = {
  async findForUser(userId: string): Promise<Verification | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('verifications', (v) => v.user_id === userId);
      return r ? toVerification(r) : null;
    }
    return null;
  },
  async create(input: {
    user_id: string;
    type: VerificationType;
  }): Promise<Verification> {
    const id = randomUUID();
    const row: MockTableRow = {
      id,
      user_id: input.user_id,
      type: input.type,
      status: 'pending',
      submitted_at: null,
      reviewed_at: null,
      reviewed_by: null,
      rejection_reason: null,
      document_type: null,
      document_urls: [],
      expiry_date: null,
      metadata: null,
    };
    if (isMockMode()) {
      // Replace any prior record for this user
      mockDb.remove('verifications', (v) => v.user_id === input.user_id);
      mockDb.insert('verifications', row);
    }
    return toVerification(row);
  },
  async submit(
    id: string,
    documentUrls: string[],
    documentType: string
  ): Promise<void> {
    if (isMockMode()) {
      mockDb.update('verifications', (v) => v.id === id, {
        status: 'under_review',
        submitted_at: new Date().toISOString(),
        document_urls: documentUrls,
        document_type: documentType,
      });
    }
  },
  async listQueue(): Promise<Verification[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('verifications')
        .filter((v) => v.status === 'under_review' || v.status === 'pending')
        .map(toVerification);
    }
    return [];
  },
  async approve(id: string, reviewerId: string): Promise<void> {
    if (isMockMode()) {
      mockDb.update('verifications', (v) => v.id === id, {
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      });
      const v = mockDb.findOne('verifications', (x) => x.id === id);
      if (v) {
        mockDb.insert('verification_badges', {
          user_id: v.user_id,
          badge_type: v.type,
          earned_at: new Date().toISOString(),
          expires_at: null,
        });
      }
    }
  },
  async reject(id: string, reviewerId: string, reason: string): Promise<void> {
    if (isMockMode()) {
      mockDb.update('verifications', (v) => v.id === id, {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        rejection_reason: reason,
      });
    }
  },
  async badgesForUser(userId: string): Promise<{ badge_type: string; earned_at: string }[]> {
    if (isMockMode()) {
      return mockDb
        .findWhere('verification_badges', (b) => b.user_id === userId)
        .map((r) => ({
          badge_type: String(r.badge_type),
          earned_at: String(r.earned_at),
        }));
    }
    return [];
  },
};

// ───────── password reset ─────────
export const resetTokenRepo = {
  async create(userId: string, token: string, ttlMinutes = 60): Promise<void> {
    const expires_at = new Date(
      Date.now() + ttlMinutes * 60_000
    ).toISOString();
    if (isMockMode()) {
      mockDb.insert('password_reset_tokens', {
        user_id: userId,
        token,
        expires_at,
        used_at: null,
      });
    }
  },
  async find(token: string): Promise<{
    user_id: string;
    expires_at: string;
    used_at: string | null;
  } | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('password_reset_tokens', (t) => t.token === token);
      if (!r) return null;
      return {
        user_id: String(r.user_id),
        expires_at: String(r.expires_at),
        used_at: r.used_at ? String(r.used_at) : null,
      };
    }
    return null;
  },
  async markUsed(token: string): Promise<void> {
    if (isMockMode()) {
      mockDb.update('password_reset_tokens', (t) => t.token === token, {
        used_at: new Date().toISOString(),
      });
    }
  },
};

// ───────── admin roles ─────────
export const adminRoleRepo = {
  async getRole(userId: string): Promise<'super_admin' | 'admin' | 'moderator' | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('admin_roles', (x) => x.user_id === userId);
      if (!r) return null;
      return r.role as 'super_admin' | 'admin' | 'moderator';
    }
    return null;
  },
  async setRole(
    userId: string,
    role: 'super_admin' | 'admin' | 'moderator'
  ): Promise<void> {
    if (isMockMode()) {
      const existing = mockDb.findOne('admin_roles', (x) => x.user_id === userId);
      if (existing) {
        mockDb.update('admin_roles', (x) => x.user_id === userId, { role });
      } else {
        mockDb.insert('admin_roles', { user_id: userId, role });
      }
    }
  },
};
