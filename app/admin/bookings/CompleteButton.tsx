'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export function CompleteButton({ bookingId }: { bookingId: string }): React.ReactElement {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Could not complete.');
        return;
      }
      push('success', 'Marked complete.');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-brand-300 hover:underline disabled:opacity-50"
    >
      {loading ? '…' : 'Mark complete'}
    </button>
  );
}
