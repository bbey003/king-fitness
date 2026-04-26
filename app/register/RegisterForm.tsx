'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Checkbox } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function RegisterForm(): React.ReactElement {
  const router = useRouter();
  const { push } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('Please agree to the terms and privacy policy.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name, email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not create account.');
        return;
      }
      push('success', `Welcome, ${name}!`);
      router.push('/account');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
      <Input
        label="Full name"
        required
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        minLength={8}
        hint="At least 8 characters."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Checkbox
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        label={
          <>
            I agree to the{' '}
            <Link href="/terms" className="text-brand-300 underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-300 underline">
              Privacy Policy
            </Link>
            .
          </>
        }
      />
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}
      <Button type="submit" loading={submitting} className="w-full">
        Create account
      </Button>
      <p className="text-sm text-white/60 text-center pt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-300 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
