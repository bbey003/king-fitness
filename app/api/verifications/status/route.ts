import { handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { verificationRepo } from '@/lib/repos/misc';

export async function GET(): Promise<Response> {
  try {
    const user = await requireUser();
    const v = await verificationRepo.findForUser(user.id);
    const badges = await verificationRepo.badgesForUser(user.id);
    return ok({ verification: v, badges });
  } catch (err) {
    return handleApiError(err);
  }
}
