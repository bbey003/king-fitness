import { handleApiError, ok, fail } from '@/lib/api';
import { getCurrentUser, clearSessionCookie } from '@/lib/auth';
import { userRepo } from '@/lib/repos/users';
import { sessionRepo } from '@/lib/repos/sessions';
import { auditRepo } from '@/lib/repos/misc';
import { bookingRepo } from '@/lib/repos/bookings';

export async function DELETE(): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, 'Not signed in.');

    // Cancel any upcoming bookings (would also issue refunds in production)
    const bookings = await bookingRepo.listForUser(user.id);
    const upcoming = bookings.filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'pending') &&
        new Date(b.start_at).getTime() > Date.now()
    );
    for (const b of upcoming) {
      await bookingRepo.updateStatus(b.id, 'cancelled_user', {
        cancellation_reason: 'account_deleted',
        refund_status: 'pending',
      });
    }

    // Anonymize PII (preserve transactions for accounting per GDPR retention)
    await userRepo.anonymize(user.id);
    await sessionRepo.deleteByUserId(user.id);
    await clearSessionCookie();

    await auditRepo.log({
      actor_id: user.id,
      action: 'account.deleted',
      target_type: 'user',
      target_id: user.id,
    });

    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
