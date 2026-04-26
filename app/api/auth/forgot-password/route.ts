import { handleApiError, ok } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { resetTokenRepo, auditRepo } from '@/lib/repos/misc';
import { userRepo } from '@/lib/repos/users';
import { forgotSchema } from '@/lib/validators';
import { randomBytes } from 'crypto';

export async function POST(req: Request): Promise<Response> {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
    if (!rl.ok)
      return ok({ ok: true, message: 'If an account exists, an email is on its way.' });

    const body = forgotSchema.parse(await req.json());
    const user = await userRepo.findByEmail(body.email.toLowerCase());
    if (user) {
      const token = randomBytes(32).toString('hex');
      await resetTokenRepo.create(user.id, token, 60);
      await auditRepo.log({
        actor_id: user.id,
        action: 'auth.password_reset_requested',
        target_type: 'user',
        target_id: user.id,
        ip_address: ip,
      });
      // In production: send email via Resend.
      // We expose token in dev to make the flow exercisable.
      const isDev = process.env.NODE_ENV !== 'production';
      return ok({
        ok: true,
        message: 'If an account exists, an email is on its way.',
        ...(isDev ? { _dev_reset_url: `/reset-password?token=${token}` } : {}),
      });
    }
    return ok({ ok: true, message: 'If an account exists, an email is on its way.' });
  } catch (err) {
    return handleApiError(err);
  }
}
