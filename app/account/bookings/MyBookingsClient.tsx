'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, X } from 'lucide-react';
import { Badge, EmptyState } from '@/components/ui/Atoms';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import type { Booking, BookingStatus } from '@/lib/types';

export interface BookingWithService extends Booking {
  service_name: string;
  cancellation_cutoff_hours: number;
}

const statusBadgeColor: Record<BookingStatus, 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'orange'> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled_user: 'gray',
  cancelled_provider: 'orange',
  completed: 'blue',
  no_show: 'red',
};

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled_user: 'Cancelled by you',
  cancelled_provider: 'Cancelled by trainer',
  completed: 'Completed',
  no_show: 'No-show',
};

export function MyBookingsClient({
  bookings,
}: {
  bookings: BookingWithService[];
}): React.ReactElement {
  const router = useRouter();
  const { push } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancelTarget, setCancelTarget] = useState<BookingWithService | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) =>
      new Date(b.start_at).getTime() >= now &&
      (b.status === 'confirmed' || b.status === 'pending')
  );
  const past = bookings.filter(
    (b) =>
      new Date(b.start_at).getTime() < now ||
      b.status === 'completed' ||
      b.status === 'cancelled_user' ||
      b.status === 'cancelled_provider' ||
      b.status === 'no_show'
  );

  const list = tab === 'upcoming' ? upcoming : past;

  function canCancel(b: BookingWithService): boolean {
    if (b.status !== 'confirmed' && b.status !== 'pending') return false;
    const start = new Date(b.start_at).getTime();
    const cutoff = b.cancellation_cutoff_hours * 60 * 60 * 1000;
    return start - Date.now() > cutoff;
  }

  async function handleCancel(): Promise<void> {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelTarget.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Could not cancel.');
        return;
      }
      push('success', 'Booking cancelled. Refund initiated.');
      setCancelTarget(null);
      setCancelReason('');
      router.refresh();
    } catch {
      push('error', 'Network error.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-white/5 rounded-full w-fit" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'upcoming'}
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-brand-500 text-white' : 'text-white/70'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'past'}
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'past' ? 'bg-brand-500 text-white' : 'text-white/70'
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} aria-hidden="true" />}
          title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
          message={
            tab === 'upcoming'
              ? "Pick a service and book your first session."
              : 'Bookings show up here once they happen.'
          }
          action={
            tab === 'upcoming' && (
              <Link href="/services" className="btn-primary">
                Book a session
              </Link>
            )
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="glass-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-display font-semibold">{b.service_name}</h3>
                    <Badge color={statusBadgeColor[b.status]}>
                      {statusLabel[b.status]}
                    </Badge>
                    {b.refund_status && (
                      <Badge color={b.refund_status === 'succeeded' ? 'green' : 'yellow'}>
                        Refund {b.refund_status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/70">
                    {new Date(b.start_at).toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {b.notes && (
                    <p className="text-xs text-white/50 mt-2 italic">"{b.notes}"</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/account/bookings/${b.id}`}
                    className="btn-ghost text-xs"
                  >
                    Details
                  </Link>
                  {canCancel(b) && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(b)}
                      className="btn-danger text-xs"
                    >
                      <X size={14} aria-hidden="true" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel this booking?"
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setCancelTarget(null)}
            >
              Keep it
            </button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              Yes, cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-white/70 mb-4">
          You'll receive a full refund. This action can't be undone.
        </p>
        <Textarea
          label="Reason (optional)"
          placeholder="Anything King should know?"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
