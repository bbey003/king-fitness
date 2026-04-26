'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function ResetForm(): React.ReactElement {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const { push } = useToast();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not reset password.');
        return;
      }
      push('success', 'Password updated. Please log in.');
      router.push('/login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!token ? (
        <div className="glass-card p-6 mt-8 text-center text-sm text-white/60">
          <p>Missing or invalid token.</p>
          <Link href="/forgot-password" className="text-brand-300 underline mt-3 inline-block">
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4 mt-8">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" loading={submitting} className="w-full">
            Update password
          </Button>
        </form>
      )}
    </>
  );
}
