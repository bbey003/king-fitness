'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/account';
  const { push } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not sign in.');
        return;
      }
      push('success', "You're in.");
      router.push(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}
      <Button type="submit" loading={submitting} className="w-full">
        Log in
      </Button>
      <div className="flex items-center justify-between text-sm pt-2">
        <Link href="/forgot-password" className="text-brand-300 hover:underline">
          Forgot password?
        </Link>
        <Link href="/register" className="text-brand-300 hover:underline">
          Create account
        </Link>
      </div>
      <div className="text-xs text-white/40 text-center pt-3 border-t border-white/10">
        Demo: demo@kingfitness.com · Demo123!Demo
      </div>
    </form>
  );
}
