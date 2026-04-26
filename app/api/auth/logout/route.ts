import { handleApiError, ok } from '@/lib/api';
import { clearSessionCookie, getSessionToken } from '@/lib/auth';
import { sessionRepo } from '@/lib/repos/sessions';

export async function POST(): Promise<Response> {
  try {
    const token = await getSessionToken();
    if (token) await sessionRepo.deleteByToken(token);
    await clearSessionCookie();
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
