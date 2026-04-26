import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { orderRepo } from '@/lib/repos/products';
import { Badge, EmptyState } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';
import { ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/orders');
  const orders = await orderRepo.listForUser(user.id);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={28} aria-hidden="true" />}
        title="No orders yet"
        message="Once you buy gear, your orders show up here."
        action={
          <Link href="/products" className="btn-primary">
            Shop the store
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/account/orders/${o.id}`}
          className="glass-card p-5 flex items-center justify-between hover:shadow-glow transition-shadow"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-mono text-xs text-white/50">#{o.id.slice(0, 8)}</p>
              <Badge color={o.status === 'paid' || o.status === 'fulfilled' ? 'green' : 'gray'}>
                {o.status}
              </Badge>
            </div>
            <p className="text-sm text-white/70">
              {new Date(o.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="font-display font-bold">
            {formatCents(o.total_cents, o.currency)}
          </div>
        </Link>
      ))}
    </div>
  );
}
