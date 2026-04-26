import { fail, handleApiError, ok } from '@/lib/api';
import { getAuthorizedUser } from '@/lib/auth';
import { canCancel } from '@/lib/booking-engine';
import { bookingRepo, serviceRepo } from '@/lib/repos/bookings';
import { paymentRepo, auditRepo } from '@/lib/repos/misc';
import { cancelSchema } from '@/lib/validators';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const auth = await getAuthorizedUser();
    if (!auth) return fail(401, 'Sign in.');
    const { id } = await params;
    const booking = await bookingRepo.findById(id);
    if (!booking) return fail(404, 'Not found.');

    const isOwn = booking.user_id === auth.user.id;
    const isProvider = auth.isProvider;
    if (!isOwn && !isProvider) return fail(403, 'Forbidden.');

    const service = await serviceRepo.findById(booking.service_id);
    if (!service) return fail(500, 'Linked service missing.');

    const body = cancelSchema.parse(await req.json().catch(() => ({})));

    if (isOwn && !isProvider) {
      const check = canCancel(booking, service);
      if (!check.allowed) {
        const msg =
          check.reason === 'past_cutoff'
            ? `Bookings must be cancelled at least ${service.cancellation_cutoff_hours} hours before the start time.`
            : 'This booking cannot be cancelled.';
        return fail(400, msg, check.reason ?? 'CANNOT_CANCEL');
      }
    }

    const newStatus = isProvider && !isOwn ? 'cancelled_provider' : 'cancelled_user';

    // Refund (mock-safe — would call Stripe in production)
    let refundStatus: 'pending' | 'succeeded' | 'failed' = 'pending';
    if (booking.stripe_payment_intent_id) {
      await paymentRepo.createTransaction({
        user_id: booking.user_id,
        type: 'refund',
        amount_cents: booking.price_cents,
        description: `Refund — booking ${booking.id}`,
        stripe_refund_id: `re_mock_${Date.now()}`,
      });
      refundStatus = 'succeeded';
    }

    await bookingRepo.updateStatus(booking.id, newStatus, {
      cancellation_reason: body.reason ?? null,
      refund_status: refundStatus,
    });

    await auditRepo.log({
      actor_id: auth.user.id,
      action: 'booking.cancelled',
      target_type: 'booking',
      target_id: booking.id,
      before_state: { status: booking.status },
      after_state: { status: newStatus, reason: body.reason },
    });

    const updated = await bookingRepo.findById(booking.id);
    return ok({ booking: updated, refund_status: refundStatus });
  } catch (err) {
    return handleApiError(err);
  }
}
