import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { auditRepo } from '@/lib/repos/misc';

export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const actorId = url.searchParams.get('actor');
    const action = url.searchParams.get('action');
    const opts: { actor_id?: string; action?: string; limit: number } = { limit: 100 };
    if (actorId) opts.actor_id = actorId;
    if (action) opts.action = action;
    const logs = await auditRepo.list(opts);
    return ok({ logs });
  } catch (err) {
    return handleApiError(err);
  }
}
