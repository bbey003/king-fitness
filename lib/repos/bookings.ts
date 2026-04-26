import { isMockMode } from '../db';
import { mockDb, type MockTableRow } from '../mock-db';
import { randomUUID } from 'crypto';
import type {
  Service,
  AvailabilityRule,
  AvailabilityOverride,
  BookingHold,
  Booking,
  BookingStatus,
} from '../types';

// ───────── helpers ─────────
function toService(r: MockTableRow): Service {
  return {
    id: String(r.id),
    provider_id: String(r.provider_id),
    name: String(r.name),
    description: String(r.description ?? ''),
    session_count: Number(r.session_count ?? 1),
    duration_minutes: Number(r.duration_minutes ?? 60),
    price_cents: Number(r.price_cents),
    buffer_after_minutes: Number(r.buffer_after_minutes ?? 0),
    max_advance_days: Number(r.max_advance_days ?? 60),
    cancellation_cutoff_hours: Number(r.cancellation_cutoff_hours ?? 24),
    is_active: r.is_active === false || r.is_active === 0 ? false : true,
    created_at: String(r.created_at),
  };
}

function toRule(r: MockTableRow): AvailabilityRule {
  return {
    id: String(r.id),
    provider_id: String(r.provider_id),
    day_of_week: Number(r.day_of_week),
    start_time: String(r.start_time),
    end_time: String(r.end_time),
    is_active: r.is_active === false || r.is_active === 0 ? false : true,
  };
}

function toOverride(r: MockTableRow): AvailabilityOverride {
  return {
    id: String(r.id),
    provider_id: String(r.provider_id),
    date: String(r.date),
    is_blocked: r.is_blocked === false || r.is_blocked === 0 ? false : true,
    note: r.note ? String(r.note) : null,
  };
}

function toHold(r: MockTableRow): BookingHold {
  return {
    id: String(r.id),
    slot_key: String(r.slot_key),
    provider_id: String(r.provider_id),
    service_id: String(r.service_id),
    user_id: r.user_id ? String(r.user_id) : null,
    start_at: String(r.start_at),
    end_at: String(r.end_at),
    held_by_ip: r.held_by_ip ? String(r.held_by_ip) : null,
    expires_at: String(r.expires_at),
  };
}

function toBooking(r: MockTableRow): Booking {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    provider_id: String(r.provider_id),
    service_id: String(r.service_id),
    start_at: String(r.start_at),
    end_at: String(r.end_at),
    status: (r.status as BookingStatus) ?? 'pending',
    notes: r.notes ? String(r.notes) : null,
    price_cents: Number(r.price_cents),
    sessions_remaining: Number(r.sessions_remaining ?? 1),
    stripe_payment_intent_id: r.stripe_payment_intent_id
      ? String(r.stripe_payment_intent_id)
      : null,
    cancellation_reason: r.cancellation_reason
      ? String(r.cancellation_reason)
      : null,
    refund_status: r.refund_status ? String(r.refund_status) : null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at ?? r.created_at),
  };
}

// ───────── services ─────────
export const serviceRepo = {
  async listActive(): Promise<Service[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('services')
        .filter((r) => r.is_active !== false && r.is_active !== 0)
        .map(toService);
    }
    return [];
  },
  async findById(id: string): Promise<Service | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('services', (s) => s.id === id);
      return r ? toService(r) : null;
    }
    return null;
  },
  async create(input: Omit<Service, 'id' | 'created_at'>): Promise<Service> {
    const id = randomUUID();
    const row: MockTableRow = {
      id,
      ...input,
      is_active: input.is_active ? 1 : 0,
      created_at: new Date().toISOString(),
    };
    if (isMockMode()) {
      mockDb.insert('services', row);
    }
    return toService(row);
  },
};

// ───────── availability rules ─────────
export const availabilityRepo = {
  async listRules(providerId: string): Promise<AvailabilityRule[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('availability_rules')
        .filter((r) => r.provider_id === providerId)
        .map(toRule);
    }
    return [];
  },
  async setRules(
    providerId: string,
    rules: Omit<AvailabilityRule, 'id' | 'provider_id'>[]
  ): Promise<void> {
    if (isMockMode()) {
      mockDb.remove(
        'availability_rules',
        (r) => r.provider_id === providerId
      );
      for (const rule of rules) {
        mockDb.insert('availability_rules', {
          provider_id: providerId,
          ...rule,
          is_active: rule.is_active ? 1 : 0,
        });
      }
    }
  },
  async listOverrides(
    providerId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<AvailabilityOverride[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('availability_overrides')
        .filter((r) => {
          if (r.provider_id !== providerId) return false;
          if (fromDate && String(r.date) < fromDate) return false;
          if (toDate && String(r.date) > toDate) return false;
          return true;
        })
        .map(toOverride);
    }
    return [];
  },
  async upsertOverride(input: {
    provider_id: string;
    date: string;
    is_blocked: boolean;
    note?: string;
  }): Promise<AvailabilityOverride> {
    if (isMockMode()) {
      const existing = mockDb.findOne(
        'availability_overrides',
        (r) => r.provider_id === input.provider_id && r.date === input.date
      );
      if (existing) {
        mockDb.update(
          'availability_overrides',
          (r) =>
            r.provider_id === input.provider_id && r.date === input.date,
          {
            is_blocked: input.is_blocked ? 1 : 0,
            note: input.note ?? null,
          }
        );
        return toOverride({
          ...existing,
          is_blocked: input.is_blocked ? 1 : 0,
          note: input.note ?? null,
        });
      }
      const row = mockDb.insert('availability_overrides', {
        provider_id: input.provider_id,
        date: input.date,
        is_blocked: input.is_blocked ? 1 : 0,
        note: input.note ?? null,
      });
      return toOverride(row);
    }
    return {
      id: randomUUID(),
      provider_id: input.provider_id,
      date: input.date,
      is_blocked: input.is_blocked,
      note: input.note ?? null,
    };
  },
};

// ───────── booking holds ─────────
export const holdRepo = {
  async findActiveBySlot(slotKey: string): Promise<BookingHold | null> {
    const now = new Date().toISOString();
    if (isMockMode()) {
      // Sweep expired first
      mockDb.remove('booking_holds', (r) => String(r.expires_at) < now);
      const r = mockDb.findOne(
        'booking_holds',
        (h) => h.slot_key === slotKey
      );
      return r ? toHold(r) : null;
    }
    return null;
  },
  async create(input: {
    slot_key: string;
    provider_id: string;
    service_id: string;
    user_id?: string;
    start_at: string;
    end_at: string;
    held_by_ip?: string;
    expires_at: string;
  }): Promise<BookingHold> {
    const id = randomUUID();
    if (isMockMode()) {
      const row = mockDb.insert('booking_holds', {
        id,
        ...input,
      });
      return toHold(row);
    }
    return { id, ...input, user_id: input.user_id ?? null, held_by_ip: input.held_by_ip ?? null };
  },
  async deleteBySlot(slotKey: string): Promise<void> {
    if (isMockMode()) {
      mockDb.remove('booking_holds', (r) => r.slot_key === slotKey);
    }
  },
  async listAllActive(): Promise<BookingHold[]> {
    const now = new Date().toISOString();
    if (isMockMode()) {
      return mockDb
        .findAll('booking_holds')
        .filter((r) => String(r.expires_at) > now)
        .map(toHold);
    }
    return [];
  },
};

// ───────── bookings ─────────
export const bookingRepo = {
  async create(
    input: Omit<
      Booking,
      'id' | 'created_at' | 'updated_at' | 'status' | 'cancellation_reason' | 'refund_status'
    > & { status?: BookingStatus }
  ): Promise<Booking> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const row: MockTableRow = {
      id,
      ...input,
      status: input.status ?? 'confirmed',
      cancellation_reason: null,
      refund_status: null,
      created_at: now,
      updated_at: now,
    };
    if (isMockMode()) {
      mockDb.insert('bookings', row);
    }
    return toBooking(row);
  },

  async findById(id: string): Promise<Booking | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('bookings', (b) => b.id === id);
      return r ? toBooking(r) : null;
    }
    return null;
  },

  async listForUser(userId: string): Promise<Booking[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('bookings')
        .filter((b) => b.user_id === userId)
        .sort(
          (a, b) =>
            new Date(String(b.start_at)).getTime() -
            new Date(String(a.start_at)).getTime()
        )
        .map(toBooking);
    }
    return [];
  },

  async listForProvider(providerId: string): Promise<Booking[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('bookings')
        .filter((b) => b.provider_id === providerId)
        .sort(
          (a, b) =>
            new Date(String(a.start_at)).getTime() -
            new Date(String(b.start_at)).getTime()
        )
        .map(toBooking);
    }
    return [];
  },

  async listInRange(
    providerId: string,
    fromIso: string,
    toIso: string
  ): Promise<Booking[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('bookings')
        .filter(
          (b) =>
            b.provider_id === providerId &&
            String(b.start_at) >= fromIso &&
            String(b.start_at) <= toIso &&
            b.status !== 'cancelled_user' &&
            b.status !== 'cancelled_provider'
        )
        .map(toBooking);
    }
    return [];
  },

  async updateStatus(
    id: string,
    status: BookingStatus,
    extra?: Partial<Booking>
  ): Promise<void> {
    if (isMockMode()) {
      mockDb.update('bookings', (b) => b.id === id, {
        status,
        ...(extra ?? {}),
      });
    }
  },

  async listAll(): Promise<Booking[]> {
    if (isMockMode()) {
      return mockDb.findAll('bookings').map(toBooking);
    }
    return [];
  },
};
