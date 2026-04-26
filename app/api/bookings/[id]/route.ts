import { fail, handleApiError, ok } from '@/lib/api';
import { getAuthorizedUser } from '@/lib/auth';
import { bookingRepo, serviceRepo } from '@/lib/repos/bookings';
import { ensureSeeded } from '@/lib/seed';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await ensureSeeded();
    const auth = await getAuthorizedUser();
    if (!auth) return fail(401, 'Sign in to view bookings.');
    const { id } = await params;
    const booking = await bookingRepo.findById(id);
    if (!booking) return fail(404, 'Booking not found.');
    if (booking.user_id !== auth.user.id && !auth.isProvider) {
      return fail(403, 'Forbidden.');
    }
    const service = await serviceRepo.findById(booking.service_id);
    return ok({ booking, service });
  } catch (err) {
    return handleApiError(err);
  }
}
