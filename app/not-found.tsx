import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <section className="relative min-h-[70vh] grid place-items-center px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-30 pointer-events-none" />
      <div className="relative text-center max-w-md">
        <p className="font-display font-bold text-7xl bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-500 mb-2">
          404
        </p>
        <h1 className="font-display font-semibold text-2xl mb-3">
          That page doesn't exist.
        </h1>
        <p className="text-white/60 text-sm mb-6">
          Maybe it moved, or maybe you took a wrong turn at the squat rack.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
