'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export default function DataPage(): React.ReactElement {
  const router = useRouter();
  const { push } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport(): Promise<void> {
    setExporting(true);
    try {
      const [me, bookings, orders, payments] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()).catch(() => ({ bookings: [] })),
        fetch('/api/orders').then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch('/api/payments/history').then((r) => r.json()).catch(() => ({ transactions: [] })),
      ]);
      const blob = new Blob(
        [JSON.stringify({ user: me.user, bookings: bookings.bookings, orders: orders.orders, payments: payments.transactions }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'king-fitness-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      push('success', 'Your data export has been downloaded.');
    } catch {
      push('error', 'Could not export. Try again.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Could not delete account.');
        return;
      }
      push('success', 'Your account has been deleted.');
      router.push('/');
      router.refresh();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-xl mb-2">Your data</h2>
        <p className="text-white/60 text-sm mb-6">
          Under GDPR, you have the right to access and delete your data at any time.
        </p>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5">
            <div>
              <h3 className="font-medium mb-1">Export your data</h3>
              <p className="text-xs text-white/60">
                Download everything we have on file as JSON.
              </p>
            </div>
            <Button variant="secondary" onClick={handleExport} loading={exporting}>
              <Download size={16} aria-hidden="true" /> Export
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div>
              <h3 className="font-medium mb-1 text-red-300">Delete your account</h3>
              <p className="text-xs text-white/60">
                Permanent. We'll anonymize your data within 30 days.
              </p>
            </div>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete your account?"
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete forever
            </Button>
          </>
        }
      >
        <div className="flex gap-3 text-sm">
          <AlertTriangle size={20} className="text-red-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-white/70">
            This will cancel any upcoming bookings, anonymize your profile, and log you
            out. Past transactions are kept for accounting and legal reasons.
          </p>
        </div>
      </Modal>
    </div>
  );
}
