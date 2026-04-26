import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { verificationRepo, auditRepo } from '@/lib/repos/misc';
import { verifyReviewSchema } from '@/lib/validators';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = verifyReviewSchema.parse(await req.json().catch(() => ({})));
    await verificationRepo.reject(id, admin.id, body.reason ?? 'Not specified');
    await auditRepo.log({
      actor_id: admin.id,
      action: 'verification.rejected',
      target_id: id,
      after_state: { reason: body.reason },
    });
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
