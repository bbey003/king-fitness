import { fail, handleApiError, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { orderRepo, productRepo } from '@/lib/repos/products';
import { paymentRepo, auditRepo } from '@/lib/repos/misc';
import { checkoutSchema } from '@/lib/validators';
import { ensureSeeded } from '@/lib/seed';
import type { ShippingAddress } from '@/lib/types';

export async function POST(req: Request): Promise<Response> {
  try {
    await ensureSeeded();
    const user = await requireUser();
    const body = checkoutSchema.parse(await req.json());

    if (body.type !== 'products') {
      return fail(400, 'Use /api/bookings for service checkouts.');
    }
    if (!body.items || body.items.length === 0) {
      return fail(400, 'Cart is empty.');
    }

    let subtotal = 0;
    const orderItems: {
      product_id: string;
      name: string;
      unit_price_cents: number;
      quantity: number;
    }[] = [];

    for (const item of body.items) {
      const p = await productRepo.findById(item.product_id);
      if (!p || !p.is_active) {
        return fail(400, `Product unavailable.`);
      }
      if (p.stock_quantity < item.quantity) {
        return fail(400, `${p.name} is out of stock.`);
      }
      subtotal += p.price_cents * item.quantity;
      orderItems.push({
        product_id: p.id,
        name: p.name,
        unit_price_cents: p.price_cents,
        quantity: item.quantity,
      });
    }
    const shippingCents = subtotal >= 7500 ? 0 : 599;
    const taxCents = Math.round(subtotal * 0.0); // tax computed at fulfillment
    const total = subtotal + shippingCents + taxCents;

    // Create order pending
    const shipping: ShippingAddress | null = body.shipping_address ?? null;
    const order = await orderRepo.create({
      user_id: user.id,
      items: orderItems,
      subtotal_cents: subtotal,
      shipping_cents: shippingCents,
      tax_cents: taxCents,
      total_cents: total,
      currency: 'usd',
      shipping_address: shipping,
    });

    // Create mock payment intent (would call Stripe in production)
    const intent = await paymentRepo.createIntent({
      user_id: user.id,
      amount_cents: total,
      currency: 'usd',
      status: 'succeeded',
      stripe_payment_intent_id: `pi_mock_${Date.now()}`,
      metadata: { order_id: order.id, type: 'products' },
    });
    await paymentRepo.createTransaction({
      user_id: user.id,
      payment_intent_id: intent.id,
      type: 'charge',
      amount_cents: total,
      description: `Order ${order.id}`,
      stripe_charge_id: `ch_mock_${Date.now()}`,
    });

    await orderRepo.updateStatus(order.id, 'paid', intent.stripe_payment_intent_id ?? undefined);

    // Decrement stock
    for (const item of orderItems) {
      await productRepo.decrementStock(item.product_id, item.quantity);
    }

    await auditRepo.log({
      actor_id: user.id,
      action: 'order.created',
      target_type: 'order',
      target_id: order.id,
      after_state: { total_cents: total },
    });

    const fullOrder = await orderRepo.findById(order.id);
    return ok({ order: fullOrder });
  } catch (err) {
    return handleApiError(err);
  }
}
