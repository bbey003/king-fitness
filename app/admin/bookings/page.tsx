import { bookingRepo, serviceRepo } from '@/lib/repos/bookings';
import { userRepo } from '@/lib/repos/users';
import { ensureSeeded } from '@/lib/seed';
import { Badge, EmptyState } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';
import { Calendar } from 'lucide-react';
import { CompleteButton } from './CompleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage(): Promise<React.ReactElement> {
  await ensureSeeded();
  const bookings = await bookingRepo.listAll();
  bookings.sort(
    (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
  );

  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const user = await userRepo.findById(b.user_id);
      const service = await serviceRepo.findById(b.service_id);
      return {
        ...b,
        user_name: user?.display_name ?? 'Unknown',
        user_email: user?.email ?? '',
        service_name: service?.name ?? 'Service',
      };
    })
  );

  if (enriched.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={28} aria-hidden="true" />}
        title="No bookings yet"
        message="When clients book sessions, they'll show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display font-semibold text-xl">All bookings</h2>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 font-medium text-white/70">When</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Client</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Service</th>
                <th className="text-left px-4 py-3 font-medium text-white/70">Status</th>
                <th className="text-right px-4 py-3 font-medium text-white/70">Paid</th>
                <th className="text-right px-4 py-3 font-medium text-white/70">Action</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((b) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    {new Date(b.start_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.user_name}</div>
                    <div className="text-xs text-white/50">{b.user_email}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{b.service_name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      color={
                        b.status === 'confirmed'
                          ? 'green'
                          : b.status === 'completed'
                          ? 'blue'
                          : b.status.startsWith('cancelled')
                          ? 'gray'
                          : 'yellow'
                      }
                    >
                      {b.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCents(b.price_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    {b.status === 'confirmed' && (
                      <CompleteButton bookingId={b.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
