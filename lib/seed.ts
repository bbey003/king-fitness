/**
 * Auto-seeder. Runs once per process when first invoked.
 * Adds the trainer "King", his services (1, 5, 10 sessions), products,
 * weekly availability, and an admin role.
 */
import { mockDb } from './mock-db';
import { isMockMode } from './db';
import { hashPassword } from './auth';
import { adminRoleRepo } from './repos/misc';
import { randomUUID } from 'crypto';

declare global {
  // eslint-disable-next-line no-var
  var __seeded: boolean | undefined;
}

const PROVIDER_EMAIL = process.env.PROVIDER_USER_EMAIL ?? 'king@kingfitness.com';
const PROVIDER_DISPLAY = 'King';

let providerIdCache: string | null = null;

export async function ensureSeeded(): Promise<string> {
  if (providerIdCache) return providerIdCache;
  if (globalThis.__seeded) {
    // Look up provider id
    const r = mockDb.findOne('users', (u) => u.email === PROVIDER_EMAIL);
    if (r) {
      providerIdCache = String(r.id);
      return providerIdCache;
    }
  }

  if (!isMockMode()) {
    // Real DB present — assume admin populated provider via seed script
    // Fall back: still seed the in-memory cache for fast lookup
    globalThis.__seeded = true;
    return '';
  }

  // Provider user
  const passwordHash = await hashPassword('Demo123!Demo');
  const providerId = randomUUID();
  mockDb.insert('users', {
    id: providerId,
    email: PROVIDER_EMAIL,
    password_hash: passwordHash,
    display_name: PROVIDER_DISPLAY,
    avatar_url:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    role: 'provider',
    status: 'active',
    timezone: 'America/New_York',
    email_verified_at: new Date().toISOString(),
  });
  await adminRoleRepo.setRole(providerId, 'super_admin');

  // Demo customer
  const demoId = randomUUID();
  mockDb.insert('users', {
    id: demoId,
    email: 'demo@kingfitness.com',
    password_hash: await hashPassword('Demo123!Demo'),
    display_name: 'Demo User',
    avatar_url: null,
    role: 'user',
    status: 'active',
    timezone: 'America/New_York',
    email_verified_at: new Date().toISOString(),
  });

  // Services — 1, 5, 10 sessions
  const services: { name: string; description: string; sessions: number; price: number }[] = [
    {
      name: 'Single Session',
      description:
        'One 60-minute personal training session with King. Perfect for trying things out or a one-off tune-up.',
      sessions: 1,
      price: 9900,
    },
    {
      name: '5-Session Pack',
      description:
        'Five 60-minute personal training sessions. Save when you commit. Sessions expire after 3 months.',
      sessions: 5,
      price: 44500,
    },
    {
      name: '10-Session Pack',
      description:
        'Ten 60-minute personal training sessions. Best value for serious progress. Sessions expire after 3 months.',
      sessions: 10,
      price: 84900,
    },
  ];
  for (const s of services) {
    mockDb.insert('services', {
      id: randomUUID(),
      provider_id: providerId,
      name: s.name,
      description: s.description,
      session_count: s.sessions,
      duration_minutes: 60,
      price_cents: s.price,
      buffer_after_minutes: 15,
      max_advance_days: 90,
      cancellation_cutoff_hours: 24,
      is_active: 1,
    });
  }

  // Availability rules — Mon-Fri 6am to 8pm, Sat 8am to 2pm (UTC)
  const weekday = [
    { day_of_week: 1, start_time: '11:00', end_time: '23:00' }, // Mon (UTC = 6am-6pm ET)
    { day_of_week: 2, start_time: '11:00', end_time: '23:00' },
    { day_of_week: 3, start_time: '11:00', end_time: '23:00' },
    { day_of_week: 4, start_time: '11:00', end_time: '23:00' },
    { day_of_week: 5, start_time: '11:00', end_time: '23:00' },
    { day_of_week: 6, start_time: '13:00', end_time: '19:00' }, // Sat
  ];
  for (const w of weekday) {
    mockDb.insert('availability_rules', {
      id: randomUUID(),
      provider_id: providerId,
      ...w,
      is_active: 1,
    });
  }

  // Products
  const products = [
    {
      slug: 'resistance-band-set',
      name: 'Resistance Band Set',
      description:
        'Five resistance bands (10–50 lbs) with handles, ankle straps, and a door anchor. Perfect for travel and home workouts.',
      category: 'Bands',
      price_cents: 3900,
      compare_at_cents: 5900,
      stock_quantity: 24,
      image_url:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    },
    {
      slug: 'training-gloves',
      name: 'Pro Training Gloves',
      description:
        'Padded leather training gloves with wrist support. Reduces grip fatigue and protects palms during heavy lifts.',
      category: 'Apparel',
      price_cents: 2900,
      compare_at_cents: null,
      stock_quantity: 38,
      image_url:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=800&fit=crop',
    },
    {
      slug: 'adjustable-dumbbells',
      name: 'Adjustable Dumbbells (5–50 lb)',
      description:
        'Quick-adjust dial replaces 15 sets of dumbbells. Pair sold together. Saves space without sacrificing range.',
      category: 'Free Weights',
      price_cents: 39900,
      compare_at_cents: 49900,
      stock_quantity: 9,
      image_url:
        'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&h=800&fit=crop',
    },
    {
      slug: 'weighted-vest-20',
      name: 'Weighted Vest — 20 lb',
      description:
        '20-pound adjustable weighted vest for added load on bodyweight training, cardio, and ruck workouts.',
      category: 'Equipment',
      price_cents: 6900,
      compare_at_cents: null,
      stock_quantity: 0,
      image_url:
        'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&h=800&fit=crop',
    },
    {
      slug: 'jump-rope-pro',
      name: 'Pro Speed Jump Rope',
      description:
        'Aluminum-handled speed rope with ball bearings. Adjustable length. Smooth rotation for double-unders and HIIT.',
      category: 'Cardio',
      price_cents: 1900,
      compare_at_cents: 2900,
      stock_quantity: 56,
      image_url:
        'https://images.unsplash.com/photo-1591741535018-d042766c62eb?w=800&h=800&fit=crop',
    },
    {
      slug: 'foam-roller',
      name: 'High-Density Foam Roller',
      description:
        '36-inch high-density foam roller for myofascial release. Perfect for warm-up, cool-down, and recovery days.',
      category: 'Recovery',
      price_cents: 2400,
      compare_at_cents: null,
      stock_quantity: 30,
      image_url:
        'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=800&h=800&fit=crop',
    },
  ];
  for (const p of products) {
    mockDb.insert('products', {
      id: randomUUID(),
      ...p,
      currency: 'usd',
      is_active: 1,
    });
  }

  globalThis.__seeded = true;
  providerIdCache = providerId;
  return providerId;
}

export async function getProviderId(): Promise<string> {
  return ensureSeeded();
}
