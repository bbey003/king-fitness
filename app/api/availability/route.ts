import { handleApiError, ok } from '@/lib/api';
import { requireProvider } from '@/lib/auth';
import { availabilityRepo } from '@/lib/repos/bookings';
import { availabilityRulesSchema } from '@/lib/validators';
import { auditRepo } from '@/lib/repos/misc';
import { getProviderId } from '@/lib/seed';

export async function PUT(req: Request): Promise<Response> {
  try {
    const provider = await requireProvider();
    const body = availabilityRulesSchema.parse(await req.json());

    const providerId = (await getProviderId()) || provider.id;
    await availabilityRepo.setRules(providerId, body.rules);
    await auditRepo.log({
      actor_id: provider.id,
      action: 'availability.rules_updated',
      after_state: { count: body.rules.length },
    });

    const rules = await availabilityRepo.listRules(providerId);
    return ok({ rules });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(): Promise<Response> {
  try {
    const provider = await requireProvider();
    const providerId = (await getProviderId()) || provider.id;
    const rules = await availabilityRepo.listRules(providerId);
    const overrides = await availabilityRepo.listOverrides(providerId);
    return ok({ rules, overrides });
  } catch (err) {
    return handleApiError(err);
  }
}
