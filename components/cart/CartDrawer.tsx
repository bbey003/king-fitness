'use client';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from './CartProvider';
import { formatCents } from '@/lib/money';

export function CartDrawer(): React.ReactElement | null {
  const { drawerOpen, closeCart, lines, setQty, remove, subtotalCents, totalQty } = useCart();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-ink-950 border-l border-white/10 flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <ShoppingBag size={20} aria-hidden="true" />
            Your cart{' '}
            <span className="text-white/50 text-sm font-normal">({totalQty})</span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 rounded-full hover:bg-white/5"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {lines.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 grid place-items-center mb-3">
                <ShoppingBag size={28} className="text-white/40" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-white/60 mb-6">
                Add some gear and let's get to work.
              </p>
              <Link href="/products" onClick={closeCart} className="btn-primary text-sm">
                Browse the shop
              </Link>
            </div>
          ) : (
            lines.map((line) => (
              <div
                key={line.product_id}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-ink-950 flex-shrink-0">
                  {line.image_url ? (
                    <Image
                      src={line.image_url}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/30 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    className="text-sm font-medium block truncate hover:text-brand-200"
                  >
                    {line.name}
                  </Link>
                  <div className="text-xs text-white/60 mt-0.5">
                    {formatCents(line.unit_price_cents)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.product_id, line.quantity - 1)}
                      aria-label={`Decrease quantity of ${line.name}`}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="text-sm w-6 text-center" aria-live="polite">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.product_id, line.quantity + 1)}
                      aria-label={`Increase quantity of ${line.name}`}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(line.product_id)}
                      aria-label={`Remove ${line.name}`}
                      className="ml-auto p-1 rounded-md text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-white/10 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Subtotal</span>
              <span className="font-semibold">{formatCents(subtotalCents)}</span>
            </div>
            <div className="text-xs text-white/50">
              Shipping and taxes calculated at checkout.
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
