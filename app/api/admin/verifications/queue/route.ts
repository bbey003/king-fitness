import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { verificationRepo } from '@/lib/repos/misc';
import { userRepo } from '@/lib/repos/users';

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
    const queue = await verificationRepo.listQueue();
    const enriched = await Promise.all(
      queue.map(async (v) => {
        const u = await userRepo.findById(v.user_id);
        return {
          ...v,
          user_email: u?.email ?? 'unknown',
          user_name: u?.display_name ?? 'unknown',
        };
      })
    );
    return ok({ queue: enriched });
  } catch (err) {
    return handleApiError(err);
  }
}
