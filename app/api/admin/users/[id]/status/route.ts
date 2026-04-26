import { fail, handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { userRepo, toPublicUser } from '@/lib/repos/users';
import { auditRepo } from '@/lib/repos/misc';
import { adminUserStatusSchema } from '@/lib/validators';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) return fail(400, "You can't modify your own status.");
    const body = adminUserStatusSchema.parse(await req.json());

    const user = await userRepo.findById(id);
    if (!user) return fail(404, 'User not found.');

    await userRepo.updateStatus(id, body.status);
    await auditRepo.log({
      actor_id: admin.id,
      action: `admin.user.${body.status}`,
      target_type: 'user',
      target_id: id,
      before_state: { status: user.status },
      after_state: { status: body.status, reason: body.reason },
    });

    const updated = await userRepo.findById(id);
    return ok({ user: updated ? toPublicUser(updated) : null });
  } catch (err) {
    return handleApiError(err);
  }
}
