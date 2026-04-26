import type { Metadata } from 'next';
import { ensureSeeded } from '@/lib/seed';
import { productRepo } from '@/lib/repos/products';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/Atoms';
import { ShoppingBag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Quality fitness gear curated by King — bands, gloves, dumbbells, vests, and more.',
};

export const dynamic = 'force-dynamic';

export default async function ProductsPage(): Promise<React.ReactElement> {
  await ensureSeeded();
  const products = await productRepo.listActive();

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300 font-semibold mb-3">
            Shop
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight">
            Gear that earns its keep.
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Curated equipment I actually use with clients. No fluff, no junk — just stuff that works.
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs text-white/60">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              🔒 Secure checkout
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              📦 Free shipping over $75
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              ↩️ 30-day returns
            </span>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={28} aria-hidden="true" />}
              title="No products yet"
              message="King is curating new gear. Check back soon."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
