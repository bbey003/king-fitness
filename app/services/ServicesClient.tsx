'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ServiceCard,
  BookingCalendar,
  TimeSlotPicker,
  HoldCountdown,
  type SlotData,
} from '@/components/booking/BookingPieces';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/Atoms';
import { formatCents } from '@/lib/money';
import type { Service } from '@/lib/types';

interface Props {
  services: Service[];
  providerId: string;
  isLoggedIn: boolean;
}

type Step = 'pick_service' | 'pick_slot' | 'review' | 'confirmed';

export function ServicesClient({
  services,
  providerId,
  isLoggedIn,
}: Props): React.ReactElement {
  const router = useRouter();
  const { push } = useToast();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [step, setStep] = useState<Step>('pick_service');
  const [month, setMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [holdExpires, setHoldExpires] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Load slots when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    setHoldExpires(null);
    fetch(
      `/api/availability/${providerId}?date=${selectedDate}&service_id=${selectedService.id}`
    )
      .then((r) => r.json())
      .then((data: { slots?: SlotData[] }) => {
        setSlots(data.slots ?? []);
      })
      .catch(() => {
        push('error', 'Could not load slots. Please try again.');
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedService, providerId, push]);

  // Sticky service summary
  const handleSelectService = useCallback(
    (s: Service) => {
      setSelectedService(s);
      setStep('pick_slot');
      // smooth scroll to calendar
      setTimeout(() => {
        document
          .getElementById('booking-calendar-region')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    },
    []
  );

  const handlePickSlot = useCallback(
    async (slot: SlotData) => {
      if (!isLoggedIn) {
        // store intent and redirect to login
        try {
          sessionStorage.setItem(
            'kf_booking_intent',
            JSON.stringify({
              service_id: selectedService?.id,
              start_at: slot.start_at,
            })
          );
        } catch {
          // ignore storage errors
        }
        router.push(`/login?next=${encodeURIComponent('/services')}`);
        return;
      }
      if (!selectedService) return;

      try {
        const res = await fetch('/api/bookings/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: selectedService.id,
            start_at: slot.start_at,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          expires_at?: string;
          error?: string;
        };
        if (!res.ok) {
          push('error', data.error ?? 'Could not hold slot.');
          // refresh slots
          if (selectedDate && selectedService) {
            const r = await fetch(
              `/api/availability/${providerId}?date=${selectedDate}&service_id=${selectedService.id}`
            );
            const d = (await r.json()) as { slots?: SlotData[] };
            setSlots(d.slots ?? []);
          }
          return;
        }
        setSelectedSlot(slot);
        setHoldExpires(data.expires_at ?? null);
        setStep('review');
      } catch {
        push('error', 'Network error. Try again.');
      }
    },
    [isLoggedIn, selectedService, router, push, selectedDate, providerId]
  );

  const handleHoldExpired = useCallback(() => {
    push('error', 'Your reservation expired. Please pick a new slot.');
    setSelectedSlot(null);
    setHoldExpires(null);
    setStep('pick_slot');
  }, [push]);

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          start_at: selectedSlot.start_at,
          notes,
        }),
      });
      const data = (await res.json()) as {
        booking?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        push('error', data.error ?? 'Could not complete booking.');
        return;
      }
      setConfirmedBookingId(data.booking?.id ?? null);
      setStep('confirmed');
      push('success', 'Booking confirmed!');
    } catch {
      push('error', 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedService, selectedSlot, notes, push]);

  // ──────── render ────────
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-mesh-grad opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300 font-semibold mb-3">
            Personal Training
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-tight">
            Book a session.
          </h1>
          <p className="mt-4 text-white/70 text-lg max-w-xl mx-auto">
            Each session is 60 minutes, in-person or online. Sessions in packs are valid for 3 months.
          </p>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Step 1 — pricing */}
          <div id="services-grid" className="grid gap-6 md:grid-cols-3 mb-12">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                onSelect={handleSelectService}
                isSelected={selectedService?.id === s.id}
                featured={s.session_count === 5}
              />
            ))}
          </div>

          {/* Step 2 — calendar + slots */}
          {selectedService && step !== 'confirmed' && (
            <div
              id="booking-calendar-region"
              className="grid gap-6 md:grid-cols-[1fr_1fr] mb-8"
            >
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-2xl">Pick a day</h2>
                <BookingCalendar
                  month={month}
                  onSelectDate={(iso) => setSelectedDate(iso)}
                  selectedDate={selectedDate}
                  onChangeMonth={(delta) =>
                    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
                  }
                />
              </div>
              <div className="space-y-4">
                <h2 className="font-display font-semibold text-2xl">Pick a time</h2>
                {!selectedDate ? (
                  <div className="glass-card p-8 text-center text-sm text-white/50">
                    Choose a date to see available times.
                  </div>
                ) : (
                  <div className="glass-card p-5">
                    <TimeSlotPicker
                      slots={slots}
                      loading={slotsLoading}
                      onSelect={handlePickSlot}
                      selectedKey={selectedSlot?.slot_key ?? null}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — review */}
          {step === 'review' && selectedService && selectedSlot && (
            <div id="review-region" className="glass-card p-6 sm:p-8 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <h2 className="font-display font-semibold text-2xl">Review and confirm</h2>
                {holdExpires && (
                  <HoldCountdown
                    expiresAt={holdExpires}
                    onExpired={handleHoldExpired}
                  />
                )}
              </div>

              <dl className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <dt className="text-xs text-white/50 uppercase tracking-wider mb-1">
                    Service
                  </dt>
                  <dd className="font-medium">{selectedService.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/50 uppercase tracking-wider mb-1">
                    Sessions
                  </dt>
                  <dd className="font-medium">{selectedService.session_count}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/50 uppercase tracking-wider mb-1">
                    First session
                  </dt>
                  <dd className="font-medium">
                    {new Date(selectedSlot.start_at).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-white/50 uppercase tracking-wider mb-1">
                    Total
                  </dt>
                  <dd className="font-display font-bold text-2xl text-brand-200">
                    {formatCents(selectedService.price_cents)}
                  </dd>
                </div>
              </dl>

              <Textarea
                label="Anything I should know?"
                placeholder="Goals, injuries, schedule notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                hint="Optional but helpful."
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleConfirm} loading={submitting}>
                  Confirm and pay {formatCents(selectedService.price_cents)}
                </Button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep('pick_slot')}
                >
                  Change time
                </button>
              </div>

              <p className="mt-4 text-xs text-white/50">
                In dev mode, payments are simulated. In production, Stripe handles secure
                checkout.
              </p>
            </div>
          )}

          {/* Step 4 — confirmation */}
          {step === 'confirmed' && confirmedBookingId && (
            <div className="glass-card p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 grid place-items-center mx-auto mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-300"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-3xl mb-2">You're booked.</h2>
              <p className="text-white/70 mb-6">
                Confirmation has been added to your account.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/account/bookings/${confirmedBookingId}`}
                  className="btn-primary"
                >
                  View booking
                </Link>
                <Link href="/account/bookings" className="btn-secondary">
                  All bookings
                </Link>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="text-center text-sm text-white/60 mt-8">
              <Link href="/login" className="text-brand-300 underline">
                Log in
              </Link>{' '}
              or{' '}
              <Link href="/register" className="text-brand-300 underline">
                create an account
              </Link>{' '}
              to complete your booking.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
