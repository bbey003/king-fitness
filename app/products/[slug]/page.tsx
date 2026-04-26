import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ensureSeeded } from '@/lib/seed';
import { productRepo } from '@/lib/repos/products';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await ensureSeeded();
  const product = await productRepo.findBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  await ensureSeeded();
  const product = await productRepo.findBySlug(slug);
  if (!product) notFound();

  const all = await productRepo.listActive();
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <section className="relative pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/50">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/products" className="hover:text-white">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-white" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <ProductDetailClient product={product} />
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display font-semibold text-2xl mb-6">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
