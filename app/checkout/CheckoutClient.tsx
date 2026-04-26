'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { formatCents } from '@/lib/money';

export function CheckoutClient({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}): React.ReactElement {
  const { lines, subtotalCents, clear } = useCart();
  const router = useRouter();
  const { push } = useToast();

  const [name, setName] = useState(userName);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [submitting, setSubmitting] = useState(false);

  const shippingCents = subtotalCents >= 7500 ? 0 : 599;
  const totalCents = subtotalCents + shippingCents;

  if (lines.length === 0) {
    return (
      <section className="min-h-[60vh] grid place-items-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-display font-bold text-3xl mb-3">Your cart is empty</h1>
          <p className="text-white/60 mb-6">Add some gear before checking out.</p>
          <Link href="/products" className="btn-primary">
            Shop the store
          </Link>
        </div>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'products',
          items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
          shipping_address: {
            name,
            line1,
            line2,
            city,
            state: stateRegion,
            postal_code: postalCode,
            country,
          },
        }),
      });
      const data = (await res.json()) as { order?: { id: string }; error?: string };
      if (!res.ok || !data.order) {
        push('error', data.error ?? 'Could not complete order.');
        return;
      }
      clear();
      push('success', 'Payment successful!');
      router.push(`/account/orders/${data.order.id}`);
    } catch {
      push('error', 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Contact</h2>
              <p className="text-sm text-white/60">{userEmail}</p>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="font-display font-semibold text-lg">Shipping address</h2>
              <Input
                label="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="Address"
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                autoComplete="address-line1"
              />
              <Input
                label="Apartment, suite, etc."
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                autoComplete="address-line2"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                />
                <Input
                  label="State"
                  required
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  autoComplete="address-level1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal code"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  autoComplete="postal-code"
                />
                <Input
                  label="Country"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  autoComplete="country"
                />
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Payment</h2>
              <div className="rounded-xl bg-brand-500/10 border border-brand-400/30 p-4 mb-4">
                <p className="text-sm text-brand-100">
                  💳 Demo mode — payment is simulated. In production, Stripe's secure
                  payment form would render here.
                </p>
              </div>
              <Button type="submit" loading={submitting} className="w-full">
                Pay {formatCents(totalCents)}
              </Button>
              <p className="mt-3 text-xs text-white/50 text-center">
                By placing this order you agree to our{' '}
                <Link href="/terms" className="text-brand-300 underline">
                  Terms
                </Link>
                .
              </p>
            </div>
          </form>

          <aside>
            <div className="glass-card p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg mb-4">Order summary</h2>
              <div className="space-y-3 mb-5">
                {lines.map((line) => (
                  <div key={line.product_id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-ink-950 flex-shrink-0">
                      {line.image_url && (
                        <Image
                          src={line.image_url}
                          alt={line.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-xs text-white/50">Qty {line.quantity}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCents(line.unit_price_cents * line.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span>{formatCents(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span>
                    {shippingCents === 0 ? 'Free' : formatCents(shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatCents(totalCents)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
