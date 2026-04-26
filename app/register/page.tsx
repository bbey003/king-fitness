import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage(): React.ReactElement {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-50 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <h1 className="font-display font-bold text-3xl mb-2 text-center">Create your account</h1>
        <p className="text-white/60 text-center mb-8 text-sm">
          One account for bookings, orders, and your training history.
        </p>
        <RegisterForm />
      </div>
    </section>
  );
}
