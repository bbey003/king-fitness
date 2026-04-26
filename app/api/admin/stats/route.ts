import { handleApiError, ok } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { userRepo } from '@/lib/repos/users';
import { paymentRepo, verificationRepo } from '@/lib/repos/misc';
import { bookingRepo } from '@/lib/repos/bookings';
import { orderRepo } from '@/lib/repos/products';
import { ensureSeeded } from '@/lib/seed';

export async function GET(): Promise<Response> {
  try {
    await ensureSeeded();
    await requireAdmin();
    const totalUsers = await userRepo.count();
    const txns = await paymentRepo.listAllTransactions();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const revenueMTD = txns
      .filter((t) => t.type === 'charge' && t.created_at >= monthStart)
      .reduce((s, t) => s + t.amount_cents, 0);
    const refundsMTD = txns
      .filter((t) => t.type === 'refund' && t.created_at >= monthStart)
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
      days.push({ date: dayStart.slice(0, 10), revenue: rev });
    }

    return ok({
      total_users: totalUsers,
      revenue_mtd_cents: revenueMTD,
      refunds_mtd_cents: refundsMTD,
      upcoming_bookings: upcoming,
      pending_review: queue.length,
      total_orders: orders.length,
      revenue_daily: days,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
