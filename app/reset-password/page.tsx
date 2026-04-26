import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetForm } from './ResetForm';

export const metadata: Metadata = { title: 'Reset password' };

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-50 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <h1 className="font-display font-bold text-3xl mb-2 text-center">Choose a new password</h1>
        <Suspense fallback={<div className="glass-card p-6 sm:p-8 mt-8 text-center text-white/50 text-sm">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </section>
  );
}
