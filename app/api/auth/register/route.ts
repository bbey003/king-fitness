import { fail, handleApiError, ok } from '@/lib/api';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sessionRepo } from '@/lib/repos/sessions';
import { userRepo } from '@/lib/repos/users';
import { auditRepo } from '@/lib/repos/misc';
import { ensureSeeded } from '@/lib/seed';
import { registerSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    await ensureSeeded();
    const ip = clientIp(req);
    const rl = rateLimit(`register:${ip}`, 10, 60_000);
    if (!rl.ok) return fail(429, 'Too many requests, please try again later.');

    const body = registerSchema.parse(await req.json());

    const existing = await userRepo.findByEmail(body.email.toLowerCase());
    if (existing) return fail(409, 'An account with that email already exists.');

    const hash = await hashPassword(body.password);
    const user = await userRepo.create({
      email: body.email.toLowerCase(),
      password_hash: hash,
      display_name: body.display_name,
      role: 'user',
    });
    const session = await sessionRepo.create(user.id, 30);
    await setSessionCookie(session.token, session.expires_at);
    await auditRepo.log({
      actor_id: user.id,
      action: 'auth.register',
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
