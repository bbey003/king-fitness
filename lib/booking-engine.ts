import { availabilityRepo, bookingRepo, holdRepo, serviceRepo } from './repos/bookings';
import type { Booking, Service } from './types';

export interface Slot {
  start_at: string;
  end_at: string;
  state: 'available' | 'held' | 'booked';
  slot_key: string;
}

export function slotKey(providerId: string, startIso: string): string {
  return `${providerId}_${new Date(startIso).toISOString()}`;
}

/**
 * Compute available slots for a given date for a provider.
 * - Builds slots from weekly availability rules
 * - Removes blocked dates via overrides
 * - Marks held + booked
 */
export async function getAvailableSlots(opts: {
  providerId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}): Promise<Slot[]> {
  const service = await serviceRepo.findById(opts.serviceId);
  if (!service) return [];

  const targetDate = new Date(`${opts.date}T00:00:00.000Z`);
  if (Number.isNaN(targetDate.getTime())) return [];
  const dayOfWeek = targetDate.getUTCDay();

  // Check overrides
  const overrides = await availabilityRepo.listOverrides(opts.providerId, opts.date, opts.date);
  const blocked = overrides.find((o) => o.is_blocked);
  if (blocked) return [];

  // Get weekly rules for that day
  const rules = await availabilityRepo.listRules(opts.providerId);
  const dayRules = rules.filter((r) => r.day_of_week === dayOfWeek && r.is_active);

  if (dayRules.length === 0) return [];

  // Get bookings for that day to mark booked slots
  const dayStart = `${opts.date}T00:00:00.000Z`;
  const dayEnd = `${opts.date}T23:59:59.999Z`;
  const bookings = await bookingRepo.listInRange(opts.providerId, dayStart, dayEnd);

  // Get active holds
  const holds = await holdRepo.listAllActive();

  const slots: Slot[] = [];
  const duration = Math.max(15, service.duration_minutes);
  const buffer = service.buffer_after_minutes;
  const stepMin = duration + buffer;

  for (const rule of dayRules) {
    const [sh, sm] = rule.start_time.split(':').map(Number);
    const [eh, em] = rule.end_time.split(':').map(Number);
    const startMs = Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      sh ?? 0,
      sm ?? 0
    );
    const endMs = Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate(),
      eh ?? 0,
      em ?? 0
    );

    for (let t = startMs; t + duration * 60_000 <= endMs; t += stepMin * 60_000) {
      const start = new Date(t).toISOString();
      const end = new Date(t + duration * 60_000).toISOString();

      // Don't show past slots
      if (new Date(start).getTime() < Date.now()) continue;

      const key = slotKey(opts.providerId, start);

      const conflictingBooking = bookings.find((b) => {
        const bs = new Date(b.start_at).getTime();
        const be = new Date(b.end_at).getTime();
        return !(new Date(end).getTime() <= bs || new Date(start).getTime() >= be);
      });
      if (conflictingBooking) {
        slots.push({ start_at: start, end_at: end, state: 'booked', slot_key: key });
        continue;
      }

      const heldHere = holds.find((h) => h.slot_key === key);
      if (heldHere) {
        slots.push({ start_at: start, end_at: end, state: 'held', slot_key: key });
        continue;
      }

      slots.push({ start_at: start, end_at: end, state: 'available', slot_key: key });
    }
  }
  return slots;
}

/**
 * Acquires a hold on a slot. Returns null if slot is taken.
 * In MySQL mode this would use SELECT FOR UPDATE; in mock mode we use unique slot_key.
 */
export async function acquireHold(opts: {
  providerId: string;
  serviceId: string;
  startIso: string;
  userId: string;
  ip: string;
  ttlMinutes: number;
}): Promise<{ ok: true; hold_id: string; expires_at: string } | { ok: false; reason: string }> {
  const service = await serviceRepo.findById(opts.serviceId);
  if (!service) return { ok: false, reason: 'service_not_found' };

  const start = new Date(opts.startIso);
  if (Number.isNaN(start.getTime())) return { ok: false, reason: 'invalid_time' };
  if (start.getTime() < Date.now()) return { ok: false, reason: 'past_slot' };

  const end = new Date(start.getTime() + service.duration_minutes * 60_000);
  const key = slotKey(opts.providerId, start.toISOString());

  // Check existing hold
  const existing = await holdRepo.findActiveBySlot(key);
  if (existing) {
    if (existing.user_id === opts.userId) {
      // Already held by this user — refresh
      return { ok: true, hold_id: existing.id, expires_at: existing.expires_at };
    }
    return { ok: false, reason: 'slot_held' };
  }

  // Check booking conflict
  const existingBookings = await bookingRepo.listInRange(
    opts.providerId,
    new Date(start.getTime() - 60 * 60 * 1000).toISOString(),
    new Date(end.getTime() + 60 * 60 * 1000).toISOString()
  );
  const conflict = existingBookings.find((b) => {
    const bs = new Date(b.start_at).getTime();
    const be = new Date(b.end_at).getTime();
    return !(end.getTime() <= bs || start.getTime() >= be);
  });
  if (conflict) return { ok: false, reason: 'slot_booked' };

  const expires_at = new Date(Date.now() + opts.ttlMinutes * 60_000).toISOString();
  const hold = await holdRepo.create({
    slot_key: key,
    provider_id: opts.providerId,
    service_id: opts.serviceId,
    user_id: opts.userId,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    held_by_ip: opts.ip,
    expires_at,
  });
  return { ok: true, hold_id: hold.id, expires_at };
}

/**
 * Whether a booking can be cancelled given service.cancellation_cutoff_hours.
 */
export function canCancel(booking: Booking, service: Service): {
  allowed: boolean;
  reason?: string;
} {
  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    return { allowed: false, reason: 'already_cancelled_or_completed' };
  }
  const cutoffMs = service.cancellation_cutoff_hours * 60 * 60 * 1000;
  const startMs = new Date(booking.start_at).getTime();
  if (startMs - Date.now() < cutoffMs) {
    return { allowed: false, reason: 'past_cutoff' };
  }
  return { allowed: true };
}

/**
 * Server-authoritative price calculation.
 * Always look up Product/Service from DB before charging.
 */
export function authoritativePrice(service: Service): number {
  return service.price_cents;
}
