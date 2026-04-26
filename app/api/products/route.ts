import { handleApiError, ok } from '@/lib/api';
import { productRepo } from '@/lib/repos/products';
import { ensureSeeded } from '@/lib/seed';

export async function GET(): Promise<Response> {
  try {
    await ensureSeeded();
    const products = await productRepo.listActive();
    return ok({ products });
  } catch (err) {
    return handleApiError(err);
  }
}
