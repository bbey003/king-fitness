import { fail, handleApiError, ok } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { newsletterRepo } from '@/lib/repos/misc';
import { newsletterSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    const ip = clientIp(req);
    const rl = rateLimit(`newsletter:${ip}`, 5, 60_000);
    if (!rl.ok) return fail(429, 'Too many requests. Please slow down.');

    const body = newsletterSchema.parse(await req.json());
    const sub = await newsletterRepo.subscribe(body.email.toLowerCase(), ip);
    return ok({ ok: true, id: sub.id });
  } catch (err) {
    return handleApiError(err);
  }
}
