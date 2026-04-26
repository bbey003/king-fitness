'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Atoms';
import { useToast } from '@/components/ui/Toast';
import type { Verification, VerificationType } from '@/lib/types';

type Step = 'idle' | 'choose_type' | 'upload' | 'submitted';

const idTypeOptions: { value: VerificationType; label: string }[] = [
  { value: 'government_id', label: 'Government ID' },
  { value: 'phone', label: 'Phone number' },
  { value: 'email', label: 'Email address' },
  { value: 'professional_cert', label: 'Professional certification' },
];

export default function VerificationPage(): React.ReactElement {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('idle');
  const [selectedType, setSelectedType] = useState<VerificationType>('government_id');
  const [docName, setDocName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    fetch('/api/verifications/status')
      .then((r) => r.json())
      .then((data: { verification: Verification | null }) => {
        setVerification(data.verification);
        if (data.verification) {
          if (data.verification.status === 'pending') setStep('upload');
          if (data.verification.status === 'under_review') setStep('submitted');
        }
      })
      .catch(() => {
        push('error', 'Could not load verification status.');
      })
      .finally(() => setLoading(false));
  }, [push]);

  async function handleStart(): Promise<void> {
    setSubmitting(true);
    try {
      const res = await fetch('/api/verifications/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      });
      const data = (await res.json()) as { verification?: Verification; error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Could not start.');
        return;
      }
      setVerification(data.verification ?? null);
      setStep('upload');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!docName.trim()) {
      push('error', 'Enter a document name.');
      return;
    }
    setSubmitting(true);
    try {
      // In production this would upload files to S3 first and pass real URLs.
      const res = await fetch('/api/verifications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_urls: [`mock://uploads/${Date.now()}-${docName}`],
          document_type: docName,
        }),
      });
      const data = (await res.json()) as { verification?: Verification; error?: string };
      if (!res.ok) {
        push('error', data.error ?? 'Submit failed.');
        return;
      }
      setVerification(data.verification ?? null);
      setStep('submitted');
      push('success', 'Submitted for review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="glass-card p-12 text-center text-white/50 text-sm">Loading…</div>;
  }

  // Already verified
  if (verification?.status === 'approved') {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 grid place-items-center mx-auto mb-4">
          <ShieldCheck size={32} className="text-emerald-300" aria-hidden="true" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">You're verified.</h2>
        <p className="text-white/60 text-sm">
          Your trust badge is now visible on your profile.
        </p>
        <div className="mt-4">
          <Badge color="green">{verification.type.replace(/_/g, ' ')} verified</Badge>
        </div>
      </div>
    );
  }

  if (verification?.status === 'rejected') {
    return (
      <div className="glass-card p-8">
        <Badge color="red">Rejected</Badge>
        <h2 className="font-display font-bold text-2xl mt-3 mb-2">Verification declined</h2>
        <p className="text-white/70 text-sm mb-4">
          Reason: {verification.rejection_reason ?? 'Not specified'}
        </p>
        <button
          type="button"
          onClick={() => {
            setVerification(null);
            setStep('choose_type');
          }}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === 'submitted' || verification?.status === 'under_review') {
    return (
      <div className="glass-card p-8 text-center">
        <Badge color="yellow">Under review</Badge>
        <h2 className="font-display font-bold text-2xl mt-3 mb-2">Almost there</h2>
        <p className="text-white/60 text-sm">
          We're reviewing your documents. Expect an update within 1–2 business days.
        </p>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-xl mb-3">Upload your document</h2>
        <p className="text-white/60 text-sm mb-6">
          For your security, files are encrypted and reviewed only by authorized staff.
        </p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-white/80 mb-2 block">Choose file</span>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-white/15 hover:border-brand-400 transition-colors cursor-pointer">
              <Upload size={20} className="text-brand-300" aria-hidden="true" />
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setDocName(e.target.files?.[0]?.name ?? '')}
                className="text-sm text-white/70 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-500 file:text-white"
              />
            </div>
            {docName && <p className="text-xs text-emerald-300 mt-2">Selected: {docName}</p>}
          </label>
          <Button onClick={handleSubmit} loading={submitting} disabled={!docName}>
            Submit for review
          </Button>
        </div>
      </div>
    );
  }

  // step === 'idle' || 'choose_type'
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck size={24} className="text-brand-300" aria-hidden="true" />
        <h2 className="font-display font-semibold text-xl">Get verified</h2>
      </div>
      <p className="text-white/60 text-sm mb-6">
        Verified accounts get a trust badge and unlock priority support.
      </p>

      <fieldset className="space-y-2 mb-6">
        <legend className="text-sm font-medium mb-2">What are you verifying?</legend>
        {idTypeOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            <input
              type="radio"
              name="vtype"
              value={opt.value}
              checked={selectedType === opt.value}
              onChange={() => setSelectedType(opt.value)}
              className="text-brand-500"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </fieldset>

      <Button onClick={handleStart} loading={submitting}>
        Start verification
      </Button>
    </div>
  );
}
