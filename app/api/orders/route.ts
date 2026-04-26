import { fail, handleApiError, ok } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { orderRepo } from '@/lib/repos/products';

export async function GET(): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, 'Sign in.');
    const orders = await orderRepo.listForUser(user.id);
    return ok({ orders });
  } catch (err) {
    return handleApiError(err);
  }
}
