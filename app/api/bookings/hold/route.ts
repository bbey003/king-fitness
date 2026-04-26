import { fail, handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { acquireHold } from '@/lib/booking-engine';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ensureSeeded, getProviderId } from '@/lib/seed';
import { holdSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    await ensureSeeded();
    const ip = clientIp(req);
    const rl = rateLimit(`hold:${ip}`, 30, 60_000);
    if (!rl.ok) return fail(429, 'Too many requests.');

    const user = await requireUser();
    const providerId = await getProviderId();
    const body = holdSchema.parse(await req.json());

    const ttl = Number(process.env.BOOKING_HOLD_MINUTES ?? 10);
    const result = await acquireHold({
      providerId,
      serviceId: body.service_id,
      startIso: body.start_at,
      userId: user.id,
      ip,
      ttlMinutes: ttl,
    });
    if (!result.ok) {
      const map: Record<string, string> = {
        slot_held: 'That slot is being held by another customer. Please choose another.',
        slot_booked: 'That slot was just booked. Please choose another.',
        past_slot: "You can't book a slot in the past.",
        invalid_time: 'Invalid time.',
        service_not_found: 'Service not found.',
      };
      return fail(409, map[result.reason] ?? 'Slot unavailable.', result.reason.toUpperCase());
    }
    return ok({
      ok: true,
      hold_id: result.hold_id,
      expires_at: result.expires_at,
      ttl_minutes: ttl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
