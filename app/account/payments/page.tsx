import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { paymentRepo } from '@/lib/repos/misc';
import { Badge, EmptyState } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';
import { CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const txns = await paymentRepo.listTransactionsForUser(user.id);

  if (txns.length === 0) {
    return (
      <EmptyState
        icon={<CreditCard size={28} aria-hidden="true" />}
        title="No transactions yet"
        message="Charges and refunds will show up here."
      />
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="text-left px-4 py-3 font-medium text-white/70">Date</th>
            <th className="text-left px-4 py-3 font-medium text-white/70">Description</th>
            <th className="text-left px-4 py-3 font-medium text-white/70">Type</th>
            <th className="text-right px-4 py-3 font-medium text-white/70">Amount</th>
          </tr>
        </thead>
        <tbody>
          {txns.map((t) => (
            <tr key={t.id} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3 text-white/70">
                {new Date(t.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">{t.description ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge color={t.type === 'charge' ? 'blue' : 'green'}>{t.type}</Badge>
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {t.type === 'refund' ? '-' : ''}
                {formatCents(t.amount_cents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
