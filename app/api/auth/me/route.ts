import { handleApiError, ok } from '@/lib/api';
import { getCurrentUser, publicUser } from '@/lib/auth';
import { ensureSeeded } from '@/lib/seed';

export async function GET(): Promise<Response> {
  try {
    await ensureSeeded();
    const user = await getCurrentUser();
    if (!user) return ok({ user: null });
    return ok({ user: publicUser(user) });
  } catch (err) {
    return handleApiError(err);
  }
}
