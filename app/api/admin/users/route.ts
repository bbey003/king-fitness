import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { userRepo, toPublicUser } from '@/lib/repos/users';

export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? undefined;
    const status = url.searchParams.get('status');
    const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'));
    const limit = 25;

    const opts: {
      search?: string;
      status?: 'active' | 'suspended';
      limit: number;
      offset: number;
    } = { limit, offset: page * limit };
    if (q) opts.search = q;
    if (status === 'active' || status === 'suspended') opts.status = status;

    const users = await userRepo.listAll(opts);
    return ok({ users: users.map(toPublicUser), page });
  } catch (err) {
    return handleApiError(err);
  }
}
