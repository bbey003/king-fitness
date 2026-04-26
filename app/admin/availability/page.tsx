'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Checkbox } from '@/components/ui/Form';
import { useToast } from '@/components/ui/Toast';

interface Rule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailabilityPage(): React.ReactElement {
  const [rules, setRules] = useState<Rule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '17:00',
      is_active: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data: { rules: Rule[] }) => {
        if (data.rules && data.rules.length > 0) {
          // merge into 7-day grid
          const grid: Rule[] = Array.from({ length: 7 }, (_, i) => ({
            day_of_week: i,
            start_time: '09:00',
            end_time: '17:00',
            is_active: false,
          }));
          for (const r of data.rules) {
            grid[r.day_of_week] = { ...r, is_active: true };
          }
          setRules(grid);
        }
      })
      .catch(() => push('error', 'Could not load availability.'))
      .finally(() => setLoading(false));
  }, [push]);

  function updateRule(idx: number, patch: Partial<Rule>): void {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const active = rules.filter((r) => r.is_active);
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: active }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Could not save.');
        return;
      }
      push('success', 'Schedule saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="glass-card p-12 text-center text-white/50">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-xl mb-2">Weekly schedule</h2>
        <p className="text-white/60 text-sm mb-6">
          Times are stored in UTC. Toggle each day on/off and set hours.
        </p>

        <div className="space-y-3">
          {rules.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr_60px] gap-3 items-end p-3 rounded-xl bg-white/5"
            >
              <Checkbox
                checked={r.is_active}
                onChange={(e) => updateRule(i, { is_active: e.target.checked })}
                label={dayNames[i] ?? `Day ${i}`}
              />
              <Input
                label="Start (UTC)"
                type="time"
                value={r.start_time}
                onChange={(e) => updateRule(i, { start_time: e.target.value })}
                disabled={!r.is_active}
              />
              <Input
                label="End (UTC)"
                type="time"
                value={r.end_time}
                onChange={(e) => updateRule(i, { end_time: e.target.value })}
                disabled={!r.is_active}
              />
              <div className="text-xs text-white/40 text-right pb-3">
                {r.is_active ? 'open' : 'closed'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} loading={saving}>
            Save schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
