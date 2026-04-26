import { fail, handleApiError, ok } from '@/lib/api';
import { requireProvider } from '@/lib/auth';
import { bookingRepo } from '@/lib/repos/bookings';
import { auditRepo } from '@/lib/repos/misc';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const provider = await requireProvider();
    const { id } = await params;
    const booking = await bookingRepo.findById(id);
    if (!booking) return fail(404, 'Not found.');

    await bookingRepo.updateStatus(id, 'completed');
    await auditRepo.log({
      actor_id: provider.id,
      action: 'booking.completed',
      target_type: 'booking',
      target_id: id,
    });

    const updated = await bookingRepo.findById(id);
    return ok({ booking: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
