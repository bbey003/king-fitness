import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { orderRepo } from '@/lib/repos/products';
import { Badge } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const order = await orderRepo.findById(id);
  if (!order) notFound();
  if (order.user_id !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
    redirect('/account/orders');
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="font-display font-semibold text-2xl">Order details</h2>
            <p className="font-mono text-xs text-white/50 mt-1">#{order.id}</p>
          </div>
          <Badge color={order.status === 'paid' || order.status === 'fulfilled' ? 'green' : 'gray'}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between py-3 border-b border-white/10">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-white/50">Qty {item.quantity}</p>
              </div>
              <p className="font-medium">
                {formatCents(item.unit_price_cents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/60">Subtotal</dt>
            <dd>{formatCents(order.subtotal_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Shipping</dt>
            <dd>{order.shipping_cents === 0 ? 'Free' : formatCents(order.shipping_cents)}</dd>
          </div>
          {order.tax_cents > 0 && (
            <div className="flex justify-between">
              <dt className="text-white/60">Tax</dt>
              <dd>{formatCents(order.tax_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-white/10">
            <dt>Total</dt>
            <dd>{formatCents(order.total_cents)}</dd>
          </div>
        </dl>

        {order.shipping_address && (
          <div className="mt-6 p-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/50 mb-1">Shipping to</p>
            <p className="text-sm">
              {order.shipping_address.name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 ? `, ${order.shipping_address.line2}` : ''}
              <br />
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.postal_code}
              <br />
              {order.shipping_address.country}
            </p>
          </div>
        )}

        <div className="mt-6">
          <Link href="/account/orders" className="btn-ghost text-sm">
            ← All orders
          </Link>
        </div>
      </div>
    </div>
  );
}
