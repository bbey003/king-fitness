'use client';
import { useState } from 'react';
import { Input, Textarea, Checkbox } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function ContactPage(): React.ReactElement {
  const { push } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!agreed) {
      push('error', 'Please agree to the privacy policy.');
      return;
    }
    setSubmitting(true);
    // No backend route — simulate. In production this would POST to /api/contact.
    setTimeout(() => {
      setSent(true);
      setSubmitting(false);
      push('success', 'Message sent. King will get back to you soon.');
    }, 600);
  }

  return (
    <section className="relative min-h-[80vh] py-16 px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-xl">
        <h1 className="font-display font-bold text-4xl mb-2 text-center">Get in touch</h1>
        <p className="text-white/60 text-center mb-8 text-sm">
          Questions about training, products, or anything else? Drop a line.
        </p>

        {sent ? (
          <div className="glass-card p-8 text-center">
            <p className="text-emerald-300 font-medium mb-2">Message sent.</p>
            <p className="text-white/60 text-sm">
              Expect a response within one business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
            <Input
              label="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Textarea
              label="Message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              label={
                <>
                  I agree to the{' '}
                  <Link href="/privacy" className="text-brand-300 underline">
                    Privacy Policy
                  </Link>
                  .
                </>
              }
            />
            <Button type="submit" loading={submitting} className="w-full">
              Send message
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
