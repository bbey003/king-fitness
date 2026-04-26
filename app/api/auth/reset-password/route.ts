import { fail, handleApiError, ok } from '@/lib/api';
import { hashPassword } from '@/lib/auth';
import { resetTokenRepo, auditRepo } from '@/lib/repos/misc';
import { sessionRepo } from '@/lib/repos/sessions';
import { userRepo } from '@/lib/repos/users';
import { resetSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    const body = resetSchema.parse(await req.json());
    const record = await resetTokenRepo.find(body.token);
    if (!record) return fail(400, 'Invalid or expired reset token.');
    if (record.used_at) return fail(400, 'This reset link has already been used.');
    if (new Date(record.expires_at) < new Date())
      return fail(400, 'This reset link has expired.');

    const user = await userRepo.findById(record.user_id);
    if (!user) return fail(400, 'Invalid token.');

    const hash = await hashPassword(body.password);
    await userRepo.updatePassword(user.id, hash);
    await resetTokenRepo.markUsed(body.token);
    await sessionRepo.deleteByUserId(user.id);
    await auditRepo.log({
      actor_id: user.id,
      action: 'auth.password_reset',
      target_type: 'user',
      target_id: user.id,
    });

    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
