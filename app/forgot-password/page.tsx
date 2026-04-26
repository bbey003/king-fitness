'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { _dev_reset_url?: string };
      setSubmitted(true);
      if (data._dev_reset_url) setDevLink(data._dev_reset_url);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-50 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <h1 className="font-display font-bold text-3xl mb-2 text-center">
          Reset your password
        </h1>
        <p className="text-white/60 text-center mb-8 text-sm">
          We'll email you a link to set a new password.
        </p>

        {submitted ? (
          <div className="glass-card p-6 sm:p-8 text-center space-y-3">
            <p className="text-emerald-300 font-medium">Check your inbox.</p>
            <p className="text-white/60 text-sm">
              If an account with that email exists, a password reset link is on its way.
            </p>
            {devLink && (
              <p className="text-xs text-white/40 pt-3 border-t border-white/10">
                Dev:{' '}
                <Link href={devLink} className="text-brand-300 underline">
                  {devLink}
                </Link>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={submitting} className="w-full">
              Send reset link
            </Button>
            <p className="text-sm text-white/60 text-center pt-2">
              <Link href="/login" className="text-brand-300 hover:underline">
                Back to log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
