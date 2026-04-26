import { fail, ok } from '@/lib/api';
import { getStripe } from '@/lib/stripe';
import { paymentRepo, auditRepo } from '@/lib/repos/misc';

export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !sig || !secret || secret.includes('placeholder')) {
    // Mock mode — accept payload but do nothing
    return ok({ received: true, mock: true });
  }

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    return fail(400, `Webhook signature verification failed: ${err instanceof Error ? err.message : 'unknown'}`);
  }

  // Idempotency check
  const piId =
    event.type.startsWith('payment_intent') && event.data.object && 'id' in event.data.object
      ? String((event.data.object as { id: string }).id)
      : null;

  if (piId) {
    const existing = await paymentRepo.findByStripeId(piId);
    if (existing && existing.status === event.type) {
      return ok({ received: true, duplicate: true });
    }
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled': {
      if (piId) {
        const intent = await paymentRepo.findByStripeId(piId);
        if (intent) await paymentRepo.updateStatus(intent.id, event.type);
      }
      break;
    }
    case 'charge.refunded': {
      // log a refund transaction if needed
      break;
    }
    default:
      // ignore
      break;
  }

  await auditRepo.log({
    action: `webhook.${event.type}`,
    target_type: 'stripe_event',
    target_id: event.id,
  });

  return ok({ received: true });
}
