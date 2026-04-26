import { handleApiError, ok } from '@/lib/api';
import { serviceRepo } from '@/lib/repos/bookings';
import { ensureSeeded } from '@/lib/seed';

export async function GET(): Promise<Response> {
  try {
    await ensureSeeded();
    const services = await serviceRepo.listActive();
    return ok({ services });
  } catch (err) {
    return handleApiError(err);
  }
}
