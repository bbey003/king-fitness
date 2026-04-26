import { fail, handleApiError, ok } from '@/lib/api';
import { setSessionCookie, verifyPassword } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sessionRepo } from '@/lib/repos/sessions';
import { userRepo } from '@/lib/repos/users';
import { auditRepo } from '@/lib/repos/misc';
import { ensureSeeded } from '@/lib/seed';
import { loginSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    await ensureSeeded();
    const ip = clientIp(req);
    const rl = rateLimit(`login:${ip}`, 20, 60_000);
    if (!rl.ok) return fail(429, 'Too many login attempts. Please wait a minute.');

    const body = loginSchema.parse(await req.json());
    const user = await userRepo.findByEmail(body.email.toLowerCase());
    if (!user) return fail(401, 'Invalid email or password.');
    if (user.status === 'suspended')
      return fail(403, 'Your account has been suspended.');

    const valid = await verifyPassword(body.password, user.password_hash);
    if (!valid) return fail(401, 'Invalid email or password.');

    const session = await sessionRepo.create(user.id, 30);
    await setSessionCookie(session.token, session.expires_at);
    await auditRepo.log({
      actor_id: user.id,
      action: 'auth.login',
      target_type: 'user',
      target_id: user.id,
      ip_address: ip,
    });

    return ok({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
