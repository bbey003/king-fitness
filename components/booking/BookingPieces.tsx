'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check } from 'lucide-react';
import { formatCents } from '@/lib/money';
import type { Service } from '@/lib/types';

export function ServiceCard({
  service,
  onSelect,
  isSelected,
  featured,
}: {
  service: Service;
  onSelect: (s: Service) => void;
  isSelected: boolean;
  featured?: boolean;
}): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl p-6 transition-all ${
        isSelected
          ? 'bg-gradient-to-br from-brand-500/20 to-brand-800/20 border-2 border-brand-400 shadow-glow-lg'
          : 'glass-card border-2 border-transparent hover:border-white/20'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-brand-500 to-brand-800 shadow-glow">
          Most popular
        </div>
      )}
      <h3 className="font-display font-semibold text-2xl mb-1">{service.name}</h3>
      <p className="text-white/60 text-sm mb-5">{service.description}</p>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-4xl font-display font-bold">
          {formatCents(service.price_cents)}
        </span>
        {service.session_count > 1 && (
          <span className="text-sm text-white/50">
            ({formatCents(Math.round(service.price_cents / service.session_count))}/session)
          </span>
        )}
      </div>

      <ul className="space-y-2 mb-6 text-sm text-white/70">
        <li className="flex items-center gap-2">
          <Check size={14} className="text-brand-300 flex-shrink-0" aria-hidden="true" />
          <Clock size={14} className="text-white/40" aria-hidden="true" />
          {service.duration_minutes} min per session
        </li>
        <li className="flex items-center gap-2">
          <Check size={14} className="text-brand-300 flex-shrink-0" aria-hidden="true" />
          {service.session_count}{' '}
          {service.session_count === 1 ? 'session' : 'sessions'} included
        </li>
        <li className="flex items-center gap-2">
          <Check size={14} className="text-brand-300 flex-shrink-0" aria-hidden="true" />
          Sessions valid for 3 months
        </li>
        <li className="flex items-center gap-2">
          <Check size={14} className="text-brand-300 flex-shrink-0" aria-hidden="true" />
          Free cancellation up to {service.cancellation_cutoff_hours}h before
        </li>
      </ul>

      <button
        type="button"
        onClick={() => onSelect(service)}
        className={isSelected ? 'btn-secondary w-full' : 'btn-primary w-full'}
        aria-pressed={isSelected}
      >
        {isSelected ? 'Selected' : 'Book this'}
      </button>
    </motion.div>
  );
}

interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export function BookingCalendar({
  month,
  onSelectDate,
  selectedDate,
  onChangeMonth,
}: {
  month: Date;
  onSelectDate: (iso: string) => void;
  selectedDate: string | null;
  onChangeMonth: (delta: number) => void;
}): React.ReactElement {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = month.getFullYear();
  const m = month.getMonth();

  const firstDay = new Date(year, m, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const days: CalendarDay[] = [];
  for (let i = 0; i < startWeekday; i++) {
    days.push({ date: '', day: 0, inMonth: false, isToday: false, isPast: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, m, d);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    days.push({
      date: iso,
      day: d,
      inMonth: true,
      isToday: dt.getTime() === today.getTime(),
      isPast: dt.getTime() < today.getTime(),
    });
  }

  const monthLabel = month.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="p-2 rounded-lg hover:bg-white/5"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="font-display font-semibold">{monthLabel}</h3>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="p-2 rounded-lg hover:bg-white/5"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-xs text-white/40 text-center py-1.5 font-medium"
            aria-hidden="true"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid">
        {days.map((d, i) => {
          if (!d.inMonth) {
            return <div key={i} aria-hidden="true" />;
          }
          const isSelected = d.date === selectedDate;
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              disabled={d.isPast}
              onClick={() => onSelectDate(d.date)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-glow'
                  : d.isPast
                  ? 'text-white/20 cursor-not-allowed'
                  : d.isToday
                  ? 'bg-white/10 text-brand-200 hover:bg-white/15'
                  : 'hover:bg-white/5 text-white/80'
              }`}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface SlotData {
  start_at: string;
  end_at: string;
  state: 'available' | 'held' | 'booked';
  slot_key: string;
}

export function TimeSlotPicker({
  slots,
  loading,
  onSelect,
  selectedKey,
}: {
  slots: SlotData[];
  loading: boolean;
  onSelect: (slot: SlotData) => void;
  selectedKey: string | null;
}): React.ReactElement {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-white/50">
        No availability that day. Try another date.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((s) => {
        const time = new Date(s.start_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
        const disabled = s.state !== 'available';
        const selected = s.slot_key === selectedKey;
        return (
          <button
            key={s.slot_key}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(s)}
            aria-pressed={selected}
            className={`px-3 py-3 rounded-lg text-sm font-medium border transition-colors ${
              selected
                ? 'bg-brand-500 text-white border-brand-400 shadow-glow'
                : s.state === 'available'
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                : 'bg-white/5 border-white/5 text-white/30 line-through cursor-not-allowed'
            }`}
          >
            {time}
            {s.state === 'held' && (
              <span className="block text-[10px] text-white/30 mt-0.5">held</span>
            )}
            {s.state === 'booked' && (
              <span className="block text-[10px] text-white/30 mt-0.5">booked</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function HoldCountdown({
  expiresAt,
  onExpired,
}: {
  expiresAt: string;
  onExpired: () => void;
}): React.ReactElement {
  const [secs, setSecs] = useState<number>(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecs(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        onExpired();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpired]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/30 text-sm"
      aria-live="polite"
    >
      <Clock size={14} className="text-brand-300" aria-hidden="true" />
      <span>
        Slot reserved for{' '}
        <strong className="font-mono">
          {m}:{String(s).padStart(2, '0')}
        </strong>
      </span>
    </div>
  );
}
