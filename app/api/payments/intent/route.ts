import { fail, handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paymentRepo } from '@/lib/repos/misc';
import { serviceRepo } from '@/lib/repos/bookings';
import { productRepo } from '@/lib/repos/products';
import { createMockIntent, getStripe, isStripeMock } from '@/lib/stripe';
import { z } from 'zod';

const intentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('booking'),
    service_id: z.string(),
  }),
  z.object({
    type: z.literal('products'),
    items: z.array(
      z.object({
        product_id: z.string(),
        quantity: z.number().int().min(1).max(99),
      })
    ),
  }),
]);

export async function POST(req: Request): Promise<Response> {
  try {
    const user = await requireUser();
    const body = intentSchema.parse(await req.json());

    let amount = 0;
    let description = '';

    if (body.type === 'booking') {
      const service = await serviceRepo.findById(body.service_id);
      if (!service) return fail(404, 'Service not found.');
      amount = service.price_cents; // server-authoritative
      description = `Booking — ${service.name}`;
    } else {
      for (const item of body.items) {
        const p = await productRepo.findById(item.product_id);
        if (!p || !p.is_active) return fail(400, 'Product unavailable.');
        if (p.stock_quantity < item.quantity) return fail(400, `${p.name} out of stock.`);
        amount += p.price_cents * item.quantity;
      }
      description = `Order — ${body.items.length} item(s)`;
    }

    if (amount <= 0) return fail(400, 'Amount must be > 0.');

    if (isStripeMock()) {
      const mock = createMockIntent(amount);
      const intent = await paymentRepo.createIntent({
        user_id: user.id,
        amount_cents: amount,
        currency: 'usd',
        status: mock.status,
        stripe_payment_intent_id: mock.id,
        metadata: { description },
      });
      return ok({
        client_secret: mock.client_secret,
        intent_id: intent.id,
        amount_cents: amount,
        mock: true,
      });
    }

    const stripe = getStripe();
    if (!stripe) return fail(500, 'Stripe not configured.');
    const stripeIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: user.id, description },
    });
    const intent = await paymentRepo.createIntent({
      user_id: user.id,
      amount_cents: amount,
      currency: 'usd',
      status: stripeIntent.status,
      stripe_payment_intent_id: stripeIntent.id,
      metadata: { description },
    });
    return ok({
      client_secret: stripeIntent.client_secret,
      intent_id: intent.id,
      amount_cents: amount,
      mock: false,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
