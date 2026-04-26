'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prefs {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

const KEY = 'kf_cookie_consent_v1';

export function CookieBanner(): React.ReactElement | null {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setPrefs(JSON.parse(raw) as Prefs);
        return;
      }
    } catch {
      // ignore
    }
    setShow(true);
  }, []);

  function save(p: Prefs): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
    setPrefs(p);
    setShow(false);
    setShowSettings(false);
  }

  if (!show || prefs) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-md z-[80] glass-card p-5 shadow-glow-lg"
    >
      <h2 className="font-display font-semibold text-base mb-2">Cookies on King Fitness</h2>
      <p className="text-sm text-white/70 mb-4">
        We use only necessary cookies by default. You can opt in to analytics and marketing
        cookies to help us improve. Read more in our{' '}
        <Link href="/privacy" className="text-brand-300 underline">
          Privacy Policy
        </Link>
        .
      </p>

      {showSettings ? (
        <SettingsPanel onSave={save} />
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => save({ necessary: true, analytics: false, marketing: false })}
            className="btn-secondary text-sm py-2 flex-1"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="btn-ghost text-sm py-2 flex-1"
          >
            Customize
          </button>
          <button
            type="button"
            onClick={() => save({ necessary: true, analytics: true, marketing: true })}
            className="btn-primary text-sm py-2 flex-1"
          >
            Accept all
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onSave }: { onSave: (p: Prefs) => void }): React.ReactElement {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked
          disabled
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-brand-500"
          aria-label="Necessary cookies (always on)"
        />
        <span>
          <span className="font-medium block">Necessary</span>
          <span className="text-white/50 text-xs">
            Required for the site to work — login, cart, checkout.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/5 text-brand-500"
        />
        <span>
          <span className="font-medium block">Analytics</span>
          <span className="text-white/50 text-xs">
            Help us understand which pages people use.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/5 text-brand-500"
        />
        <span>
          <span className="font-medium block">Marketing</span>
          <span className="text-white/50 text-xs">
            Personalized offers and remarketing.
          </span>
        </span>
      </label>
      <button
        type="button"
        onClick={() => onSave({ necessary: true, analytics, marketing })}
        className="btn-primary text-sm py-2 w-full"
      >
        Save preferences
      </button>
    </div>
  );
}
