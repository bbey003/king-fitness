import { fail, handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { verificationRepo, auditRepo } from '@/lib/repos/misc';
import { verifyStartSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const body = verifyStartSchema.parse(await req.json());

    const existing = await verificationRepo.findForUser(user.id);
    if (existing && (existing.status === 'pending' || existing.status === 'under_review')) {
      return fail(409, 'You already have a verification in progress.');
    }

    const v = await verificationRepo.create({
      user_id: user.id,
      type: body.type,
    });
    await auditRepo.log({
      actor_id: user.id,
      action: 'verification.started',
      target_id: v.id,
    });
    return ok({ verification: v });
  } catch (err) {
    return handleApiError(err);
  }
}
