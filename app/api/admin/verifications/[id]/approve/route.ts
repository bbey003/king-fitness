import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { verificationRepo, auditRepo } from '@/lib/repos/misc';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await verificationRepo.approve(id, admin.id);
    await auditRepo.log({
      actor_id: admin.id,
      action: 'verification.approved',
      target_id: id,
    });
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
