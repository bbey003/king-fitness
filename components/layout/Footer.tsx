'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Instagram, Youtube, Twitter, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!agreed) {
      push('error', 'Please agree to the privacy policy first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, privacy_accepted: agreed }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setDone(true);
      setEmail('');
      push('success', "You're in. Welcome to the King Fitness inner circle.");
    } catch (err) {
      push('error', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 grid place-items-center font-display font-bold shadow-glow"
          >
            K
          </span>
          <span className="font-display font-bold text-xl">King Fitness</span>
        </div>
        <p className="text-white/70 max-w-xl mx-auto text-sm sm:text-base">
          Real coaching. Real results. Train one-on-one with King — and shop the gear that gets you there.
        </p>

        <div className="mt-10">
          <h3 className="font-display font-semibold text-lg mb-3">Get the weekly drop</h3>
          <p className="text-white/60 text-sm mb-5">
            Workouts, mobility tips, and gear discounts. No spam, ever.
          </p>
          {done ? (
            <p className="text-emerald-300 text-sm">
              Subscribed — check your inbox to confirm.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto space-y-3"
              aria-label="Newsletter signup"
            >
              <div className="flex gap-2">
                <label htmlFor="footer-email" className="sr-only">
                  Email
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field-input flex-1"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-4 py-3"
                  aria-label="Subscribe"
                >
                  {submitting ? '…' : <ArrowRight size={18} aria-hidden="true" />}
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-white/60 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-white/30 bg-white/5 text-brand-500"
                />
                <span>
                  I agree to receive emails from King Fitness and accept the{' '}
                  <Link href="/privacy" className="text-brand-300 underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </form>
          )}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Instagram size={18} aria-hidden="true" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Youtube size={18} aria-hidden="true" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Twitter size={18} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/50">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/products">Shop</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="mt-6 text-xs text-white/40">
          © {year} King Fitness. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
