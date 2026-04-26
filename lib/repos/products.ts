import { isMockMode } from '../db';
import { mockDb, type MockTableRow } from '../mock-db';
import { randomUUID } from 'crypto';
import type {
  Product,
  Order,
  OrderItem,
  OrderStatus,
  ShippingAddress,
} from '../types';

function toProduct(r: MockTableRow): Product {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    description: String(r.description ?? ''),
    category: String(r.category ?? ''),
    price_cents: Number(r.price_cents),
    compare_at_cents: r.compare_at_cents != null ? Number(r.compare_at_cents) : null,
    currency: String(r.currency ?? 'usd'),
    stock_quantity: Number(r.stock_quantity ?? 0),
    image_url: r.image_url ? String(r.image_url) : null,
    is_active: r.is_active === false || r.is_active === 0 ? false : true,
    created_at: String(r.created_at),
  };
}

function toOrderItem(r: MockTableRow): OrderItem {
  return {
    id: String(r.id),
    order_id: String(r.order_id),
    product_id: String(r.product_id),
    name: String(r.name),
    unit_price_cents: Number(r.unit_price_cents),
    quantity: Number(r.quantity),
  };
}

function toOrder(r: MockTableRow): Order {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    status: (r.status as OrderStatus) ?? 'pending',
    subtotal_cents: Number(r.subtotal_cents),
    tax_cents: Number(r.tax_cents ?? 0),
    shipping_cents: Number(r.shipping_cents ?? 0),
    total_cents: Number(r.total_cents),
    currency: String(r.currency ?? 'usd'),
    stripe_payment_intent_id: r.stripe_payment_intent_id
      ? String(r.stripe_payment_intent_id)
      : null,
    shipping_address: (r.shipping_address as ShippingAddress | null) ?? null,
    created_at: String(r.created_at),
  };
}

export const productRepo = {
  async listActive(): Promise<Product[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('products')
        .filter((p) => p.is_active !== false && p.is_active !== 0)
        .map(toProduct);
    }
    return [];
  },
  async findBySlug(slug: string): Promise<Product | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('products', (p) => p.slug === slug);
      return r ? toProduct(r) : null;
    }
    return null;
  },
  async findById(id: string): Promise<Product | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('products', (p) => p.id === id);
      return r ? toProduct(r) : null;
    }
    return null;
  },
  async create(input: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const id = randomUUID();
    const row: MockTableRow = {
      id,
      ...input,
      is_active: input.is_active ? 1 : 0,
    };
    if (isMockMode()) {
      mockDb.insert('products', row);
    }
    return toProduct(row);
  },
  async decrementStock(id: string, amount: number): Promise<void> {
    if (isMockMode()) {
      const p = mockDb.findOne('products', (r) => r.id === id);
      if (p) {
        const newQty = Math.max(0, Number(p.stock_quantity ?? 0) - amount);
        mockDb.update('products', (r) => r.id === id, {
          stock_quantity: newQty,
        });
      }
    }
  },
};

export const orderRepo = {
  async create(input: {
    user_id: string;
    items: { product_id: string; name: string; unit_price_cents: number; quantity: number }[];
    subtotal_cents: number;
    tax_cents?: number;
    shipping_cents?: number;
    total_cents: number;
    currency?: string;
    shipping_address: ShippingAddress | null;
  }): Promise<Order> {
    const id = randomUUID();
    const order: MockTableRow = {
      id,
      user_id: input.user_id,
      status: 'pending',
      subtotal_cents: input.subtotal_cents,
      tax_cents: input.tax_cents ?? 0,
      shipping_cents: input.shipping_cents ?? 0,
      total_cents: input.total_cents,
      currency: input.currency ?? 'usd',
      stripe_payment_intent_id: null,
      shipping_address: input.shipping_address,
      created_at: new Date().toISOString(),
    };
    if (isMockMode()) {
      mockDb.insert('orders', order);
      for (const item of input.items) {
        mockDb.insert('order_items', {
          order_id: id,
          ...item,
        });
      }
    }
    return toOrder(order);
  },

  async findById(id: string): Promise<Order | null> {
    if (isMockMode()) {
      const r = mockDb.findOne('orders', (o) => o.id === id);
      if (!r) return null;
      const items = mockDb
        .findWhere('order_items', (it) => it.order_id === id)
        .map(toOrderItem);
      const order = toOrder(r);
      order.items = items;
      return order;
    }
    return null;
  },

  async listForUser(userId: string): Promise<Order[]> {
    if (isMockMode()) {
      return mockDb
        .findAll('orders')
        .filter((o) => o.user_id === userId)
        .sort(
          (a, b) =>
            new Date(String(b.created_at)).getTime() -
            new Date(String(a.created_at)).getTime()
        )
        .map(toOrder);
    }
    return [];
  },

  async listAll(): Promise<Order[]> {
    if (isMockMode()) return mockDb.findAll('orders').map(toOrder);
    return [];
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    paymentIntentId?: string
  ): Promise<void> {
    if (isMockMode()) {
      mockDb.update('orders', (o) => o.id === id, {
        status,
        ...(paymentIntentId
          ? { stripe_payment_intent_id: paymentIntentId }
          : {}),
      });
    }
  },
};
