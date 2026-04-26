import { fail, handleApiError } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { userRepo } from '@/lib/repos/users';
import { paymentRepo, auditRepo } from '@/lib/repos/misc';

function csvEscape(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  try {
    const admin = await requireAdmin();
    const { type } = await params;
    const rl = rateLimit(`export:${admin.id}`, 1, 5 * 60_000);
    if (!rl.ok) return fail(429, 'Exports limited to 1 per 5 minutes.');

    let csv = '';
    let filename = 'export.csv';

    if (type === 'users') {
      filename = 'users.csv';
      csv = 'id,email,display_name,role,status,created_at\n';
      const users = await userRepo.listAll({ limit: 10000 });
      for (const u of users) {
        csv += [u.id, u.email, u.display_name, u.role, u.status, u.created_at]
          .map(csvEscape)
          .join(',') + '\n';
      }
    } else if (type === 'transactions') {
      filename = 'transactions.csv';
      csv = 'id,user_id,type,amount_cents,description,created_at\n';
      const txns = await paymentRepo.listAllTransactions();
      for (const t of txns) {
        csv += [t.id, t.user_id, t.type, t.amount_cents, t.description, t.created_at]
          .map(csvEscape)
          .join(',') + '\n';
      }
    } else {
      return fail(400, 'Unknown export type.');
    }

    await auditRepo.log({
      actor_id: admin.id,
      action: 'admin.export',
      target_type: 'export',
      target_id: type,
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
