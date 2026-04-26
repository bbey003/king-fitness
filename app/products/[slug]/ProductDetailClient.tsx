'use client';
import { useState } from 'react';
import { ShoppingBag, Minus, Plus, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Atoms';
import { Button } from '@/components/ui/Button';
import { formatCents } from '@/lib/money';
import type { Product } from '@/lib/types';

export function ProductDetailClient({ product }: { product: Product }): React.ReactElement {
  const { addItem } = useCart();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock_quantity <= 0;

  function handleAdd(): void {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      unit_price_cents: product.price_cents,
      image_url: product.image_url,
      quantity: qty,
    });
    push('success', `Added ${qty} × ${product.name}`);
  }

  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
        {product.category}
      </p>
      <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight mb-3">
        {product.name}
      </h1>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-3xl font-display font-bold">
          {formatCents(product.price_cents)}
        </span>
        {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
          <>
            <span className="text-lg text-white/40 line-through">
              {formatCents(product.compare_at_cents)}
            </span>
            <Badge color="green">
              Save {formatCents(product.compare_at_cents - product.price_cents)}
            </Badge>
          </>
        )}
      </div>

      <p className="text-white/70 leading-relaxed mb-6">{product.description}</p>

      {!outOfStock && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-white/60">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="p-2 rounded-md bg-white/5 hover:bg-white/10"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="w-8 text-center font-medium" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() =>
                setQty((q) => Math.min(product.stock_quantity, q + 1))
              }
              aria-label="Increase quantity"
              className="p-2 rounded-md bg-white/5 hover:bg-white/10"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={handleAdd} disabled={outOfStock}>
          <ShoppingBag size={18} aria-hidden="true" />
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>

      {product.stock_quantity > 0 && product.stock_quantity < 10 && (
        <p className="text-sm text-yellow-300 mb-6">
          Only {product.stock_quantity} left in stock — order soon.
        </p>
      )}

      <ul className="space-y-3 text-sm text-white/70 border-t border-white/10 pt-6">
        <li className="flex items-center gap-3">
          <Truck size={18} className="text-brand-300" aria-hidden="true" />
          Free shipping on orders over $75
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-brand-300" aria-hidden="true" />
          Secure checkout via Stripe
        </li>
        <li className="flex items-center gap-3">
          <RotateCcw size={18} className="text-brand-300" aria-hidden="true" />
          30-day returns, no questions asked
        </li>
      </ul>
    </div>
  );
}
