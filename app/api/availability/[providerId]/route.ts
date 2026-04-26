import { fail, handleApiError, ok } from '@/lib/api';
import { getAvailableSlots } from '@/lib/booking-engine';
import { ensureSeeded } from '@/lib/seed';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ providerId: string }> }
): Promise<Response> {
  try {
    await ensureSeeded();
    const { providerId } = await params;
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const serviceId = url.searchParams.get('service_id');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return fail(400, 'Invalid date');
    if (!serviceId) return fail(400, 'service_id is required');
    const slots = await getAvailableSlots({
      providerId,
      serviceId,
      date,
    });
    return ok({ slots });
  } catch (err) {
    return handleApiError(err);
  }
}
