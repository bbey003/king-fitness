'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative min-h-[70vh] grid place-items-center px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-30 pointer-events-none" />
      <div className="relative text-center max-w-md">
        <p className="font-display font-bold text-7xl bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-brand-500 mb-2">
          Oops
        </p>
        <h1 className="font-display font-semibold text-2xl mb-3">Something went wrong.</h1>
        <p className="text-white/60 text-sm mb-6">
          We've logged the issue. Try again, or head back home.
        </p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
