import { fail, handleApiError, ok } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { paymentRepo } from '@/lib/repos/misc';

export async function GET(): Promise<Response> {
  try {
    const user = await getCurrentUser();
    if (!user) return fail(401, 'Sign in.');
    const txns = await paymentRepo.listTransactionsForUser(user.id);
    return ok({ transactions: txns });
  } catch (err) {
    return handleApiError(err);
  }
}
