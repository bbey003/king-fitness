import { handleApiError, ok } from '@/lib/api';
import { requireProvider } from '@/lib/auth';
import { availabilityRepo } from '@/lib/repos/bookings';
import { overrideSchema } from '@/lib/validators';
import { auditRepo } from '@/lib/repos/misc';
import { getProviderId } from '@/lib/seed';

export async function POST(req: Request): Promise<Response> {
  try {
    const provider = await requireProvider();
    const body = overrideSchema.parse(await req.json());
    const providerId = (await getProviderId()) || provider.id;
    const ov = await availabilityRepo.upsertOverride({
      provider_id: providerId,
      date: body.date,
      is_blocked: body.is_blocked,
      ...(body.note ? { note: body.note } : {}),
    });
    await auditRepo.log({
      actor_id: provider.id,
      action: 'availability.override',
      after_state: { date: body.date, blocked: body.is_blocked },
    });
    return ok({ override: ov });
  } catch (err) {
    return handleApiError(err);
  }
}
