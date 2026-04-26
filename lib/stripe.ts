/**
 * Stripe wrapper.
 * If STRIPE_SECRET_KEY is missing or a placeholder, returns a mock-safe stub
 * so the booking + product flows still work end-to-end in dev.
 */
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function realKey(): string | null {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) return null;
  if (k.startsWith('sk_') && !k.includes('placeholder')) return k;
  return null;
}

export function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = realKey();
  if (!key) return null;
  stripeClient = new Stripe(key, { apiVersion: '2024-06-20' });
  return stripeClient;
}

export function isStripeMock(): boolean {
  return realKey() === null;
}

export interface MockIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'requires_payment_method' | 'requires_confirmation';
}

export function createMockIntent(amount: number, currency = 'usd'): MockIntent {
  const id = `pi_mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    client_secret: `${id}_secret_mock`,
    amount,
    currency,
    status: 'requires_confirmation',
  };
}
