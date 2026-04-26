'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { formatCents } from '@/lib/money';
import { Badge } from '@/components/ui/Atoms';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }): React.ReactElement {
  const { addItem } = useCart();
  const { push } = useToast();
  const outOfStock = product.stock_quantity <= 0;

  function handleAdd(): void {
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      unit_price_cents: product.price_cents,
      image_url: product.image_url,
      quantity: 1,
    });
    push('success', `Added ${product.name}`);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="group glass-card overflow-hidden hover:shadow-glow transition-shadow"
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-ink-950">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/30 text-sm">
            No image
          </div>
        )}
        {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
          <div className="absolute top-3 left-3">
            <Badge color="green">
              Save {formatCents(product.compare_at_cents - product.price_cents)}
            </Badge>
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 grid place-items-center">
            <Badge color="red">Out of stock</Badge>
          </div>
        )}
      </Link>
      <div className="p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold text-lg leading-tight mb-2 hover:text-brand-200 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-bold text-lg">
            {formatCents(product.price_cents)}
          </span>
          {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
            <span className="text-sm text-white/40 line-through">
              {formatCents(product.compare_at_cents)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-primary w-full text-sm py-2.5"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          {outOfStock ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </motion.article>
  );
}
