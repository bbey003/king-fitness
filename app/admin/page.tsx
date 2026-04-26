import { ensureSeeded } from '@/lib/seed';
import { userRepo } from '@/lib/repos/users';
import { paymentRepo, verificationRepo } from '@/lib/repos/misc';
import { bookingRepo } from '@/lib/repos/bookings';
import { orderRepo } from '@/lib/repos/products';
import { formatCents } from '@/lib/money';
import { RevenueChart } from './RevenueChart';
import { Users, Calendar, DollarSign, ShieldCheck, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard(): Promise<React.ReactElement> {
  await ensureSeeded();
  const totalUsers = await userRepo.count();
  const txns = await paymentRepo.listAllTransactions();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const revenueMTD = txns
    .filter((t) => t.type === 'charge' && t.created_at >= monthStart)
    .reduce((s, t) => s + t.amount_cents, 0);

  const allBookings = await bookingRepo.listAll();
  const upcoming = allBookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.start_at).getTime() > Date.now()
  ).length;
  const queue = await verificationRepo.listQueue();
  const orders = await orderRepo.listAll();

  // Daily revenue last 30 days
  const days: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const dayStart = d.toISOString();
    const dayEnd = new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const rev = txns
      .filter(
        (t) => t.type === 'charge' && t.created_at >= dayStart && t.created_at < dayEnd
      )
      .reduce((s, t) => s + t.amount_cents, 0);
    days.push({ date: dayStart.slice(0, 10), revenue: rev / 100 });
  }

  const stats = [
    { label: 'Total users', value: totalUsers.toString(), Icon: Users },
    {
      label: 'Revenue MTD',
      value: formatCents(revenueMTD),
      Icon: DollarSign,
    },
    { label: 'Upcoming bookings', value: upcoming.toString(), Icon: Calendar },
    { label: 'Pending review', value: queue.length.toString(), Icon: ShieldCheck },
    { label: 'Orders', value: orders.length.toString(), Icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="glass-card p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 grid place-items-center mb-3">
              <Icon size={18} className="text-brand-300" aria-hidden="true" />
            </div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="font-display font-bold text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">
          Revenue — last 30 days
        </h2>
        <RevenueChart data={days} />
      </div>
    </div>
  );
}
