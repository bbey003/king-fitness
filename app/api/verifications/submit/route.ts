import { fail, handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { verificationRepo, auditRepo } from '@/lib/repos/misc';
import { verifySubmitSchema } from '@/lib/validators';

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const body = verifySubmitSchema.parse(await req.json());
    const v = await verificationRepo.findForUser(user.id);
    if (!v) return fail(404, 'No verification in progress. Start one first.');
    if (v.status !== 'pending') return fail(400, 'Verification already submitted.');

    await verificationRepo.submit(v.id, body.document_urls, body.document_type);
    await auditRepo.log({
      actor_id: user.id,
      action: 'verification.submitted',
      target_id: v.id,
    });
    const updated = await verificationRepo.findForUser(user.id);
    return ok({ verification: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
