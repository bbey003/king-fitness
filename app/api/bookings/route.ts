import { fail, handleApiError, ok } from '@/lib/api';
import { getAuthorizedUser, requireUser } from '@/lib/auth';
import { authoritativePrice } from '@/lib/booking-engine';
import { paymentRepo } from '@/lib/repos/misc';
import {
  bookingRepo,
  holdRepo,
  serviceRepo,
} from '@/lib/repos/bookings';
import { ensureSeeded, getProviderId } from '@/lib/seed';
import { bookingCreateSchema } from '@/lib/validators';
import { auditRepo } from '@/lib/repos/misc';
import { slotKey } from '@/lib/booking-engine';

// GET — list bookings (own for user, all for provider/admin)
export async function GET(): Promise<Response> {
  try {
    await ensureSeeded();
    const auth = await getAuthorizedUser();
    if (!auth) return fail(401, 'Sign in to view bookings.');

    if (auth.isProvider) {
      const list = await bookingRepo.listForProvider(auth.user.id);
      return ok({ bookings: list });
    }
    const list = await bookingRepo.listForUser(auth.user.id);
    return ok({ bookings: list });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST — create booking after (mock or real) payment
export async function POST(req: Request): Promise<Response> {
  try {
    await ensureSeeded();
    const user = await requireUser();
    const providerId = await getProviderId();
    const body = bookingCreateSchema.parse(await req.json());

    const service = await serviceRepo.findById(body.service_id);
    if (!service) return fail(404, 'Service not found.');

    // Server-authoritative price
    const priceCents = authoritativePrice(service);

    const start = new Date(body.start_at);
    if (Number.isNaN(start.getTime())) return fail(400, 'Invalid time.');
    const end = new Date(start.getTime() + service.duration_minutes * 60_000);

    const key = slotKey(providerId, start.toISOString());
    const hold = await holdRepo.findActiveBySlot(key);
    if (hold && hold.user_id !== user.id) {
      return fail(409, 'That slot is held by another user.');
    }

    // Check no booking conflict
    const conflicts = await bookingRepo.listInRange(
      providerId,
      new Date(start.getTime() - 60 * 60 * 1000).toISOString(),
      new Date(end.getTime() + 60 * 60 * 1000).toISOString()
    );
    const conflict = conflicts.find((b) => {
      const bs = new Date(b.start_at).getTime();
      const be = new Date(b.end_at).getTime();
      return !(end.getTime() <= bs || start.getTime() >= be);
    });
    if (conflict) return fail(409, 'That slot is no longer available.');

    // Create payment intent (mock)
    const intent = await paymentRepo.createIntent({
      user_id: user.id,
      amount_cents: priceCents,
      currency: 'usd',
      status: 'succeeded',
      metadata: { type: 'booking', service_id: service.id },
      stripe_payment_intent_id: `pi_mock_${Date.now()}`,
    });
    await paymentRepo.createTransaction({
      user_id: user.id,
      payment_intent_id: intent.id,
      type: 'charge',
      amount_cents: priceCents,
      description: `Booking — ${service.name}`,
      stripe_charge_id: `ch_mock_${Date.now()}`,
    });

    // Create booking confirmed
    const booking = await bookingRepo.create({
      user_id: user.id,
      provider_id: providerId,
      service_id: service.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      notes: body.notes ?? null,
      price_cents: priceCents,
      sessions_remaining: service.session_count,
      stripe_payment_intent_id: intent.stripe_payment_intent_id,
      status: 'confirmed',
    });

    // Release hold
    await holdRepo.deleteBySlot(key);

    await auditRepo.log({
      actor_id: user.id,
      action: 'booking.created',
      target_type: 'booking',
      target_id: booking.id,
      after_state: { service_id: service.id, start_at: booking.start_at },
    });

    return ok({ booking });
  } catch (err) {
    return handleApiError(err);
  }
}
