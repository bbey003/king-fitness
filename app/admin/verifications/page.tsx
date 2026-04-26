'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Atoms';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Form';
import type { Verification } from '@/lib/types';

interface Item extends Verification {
  user_email: string;
  user_name: string;
}

export default function AdminVerificationsPage(): React.ReactElement {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Item | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  function load(): void {
    setLoading(true);
    fetch('/api/admin/verifications/queue')
      .then((r) => r.json())
      .then((d: { queue: Item[] }) => setItems(d.queue ?? []))
      .catch(() => push('error', 'Could not load queue.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string): Promise<void> {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        push('error', d.error ?? 'Failed.');
        return;
      }
      push('success', 'Approved.');
      load();
    } finally {
      setBusy(false);
    }
  }

  async function reject(): Promise<void> {
    if (!rejectTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/verifications/${rejectTarget.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        push('error', d.error ?? 'Failed.');
        return;
      }
      push('success', 'Rejected.');
      setRejectTarget(null);
      setReason('');
      load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="glass-card p-12 text-center text-white/50">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-white/50">
        No verifications waiting for review.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display font-semibold text-xl">Verification queue</h2>
      <ul className="space-y-3">
        {items.map((v) => (
          <li key={v.id} className="glass-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium">{v.user_name}</span>
                  <span className="text-white/50 text-sm">{v.user_email}</span>
                  <Badge color="yellow">{v.status.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-xs text-white/50">
                  Type: <span className="text-white/80">{v.type.replace(/_/g, ' ')}</span>
                  {v.document_type && (
                    <>
                      {' · '}Doc:{' '}
                      <span className="text-white/80">{v.document_type}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => approve(v.id)} disabled={busy}>
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setRejectTarget(v)}
                  disabled={busy}
                >
                  Reject
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="Reject verification"
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </button>
            <Button variant="danger" onClick={reject} loading={busy}>
              Reject
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          required
          placeholder="Document is blurry, wrong type, etc."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
