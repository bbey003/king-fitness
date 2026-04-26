# King Fitness

> Real coaching. Real results. A complete e-commerce + booking website for King's personal training business — book sessions, shop equipment, manage your account.

A production-shaped Next.js 14 application built end-to-end: full auth, booking system with hold mechanism, server-authoritative pricing, Stripe payments, admin panel, GDPR compliance, and a futuristic UI.

## Features

- **Personal training booking** — 1, 5, and 10-session packages, calendar-driven slot picker, 10-minute hold to prevent races, 24-hour cancellation policy with refunds
- **E-commerce** — fitness gear catalog, persistent cart, secure checkout, order history
- **Authentication** — bcrypt-hashed passwords, httpOnly session cookies, password reset, role-based access
- **Admin panel** — dashboard with revenue chart, user management, booking timeline, availability scheduling, audit log, identity verification queue, CSV exports
- **GDPR-compliant** — granular cookie consent, data export, account deletion (right to be forgotten), audit logging
- **Mock-safe** — runs end-to-end without MySQL or Stripe credentials. Auto-seeds data on first request.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000) with no setup required. An in-memory mock database auto-populates with King (the trainer), services, and products on first request.

### Demo credentials

| Role     | Email                   | Password       |
| -------- | ----------------------- | -------------- |
| Customer | `demo@kingfitness.com`  | `Demo123!Demo` |
| Trainer  | `king@kingfitness.com`  | `Demo123!Demo` |

The trainer account has access to `/admin`.

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 14 (App Router, RSC)                    |
| Language      | TypeScript (strict, no `any`)                   |
| Styling       | Tailwind CSS, Framer Motion                     |
| Database      | MySQL via `mysql2` (with mock-DB fallback)      |
| Auth          | bcrypt + httpOnly cookies                       |
| Payments      | Stripe (mock fallback when no keys present)     |
| Validation    | Zod                                             |
| Charts        | Recharts                                        |
| Icons         | Lucide                                          |

## Project Structure

```
app/                       Next.js App Router
├── (pages)                Home, About, Services, Products, Blog, etc.
├── account/               Customer account section
├── admin/                 Admin panel (trainer-only)
├── api/                   API route handlers (auth, bookings, payments, admin)
└── globals.css

components/
├── booking/               BookingCalendar, TimeSlotPicker, HoldCountdown
├── cart/                  CartProvider, CartDrawer
├── layout/                Navbar, Footer, CookieBanner
├── marketing/             Hero, FloatingCard
├── products/              ProductCard
└── ui/                    Button, Form fields, Modal, Toast, Atoms, DataTable

lib/
├── auth.ts                Session, password hashing, role gates
├── booking-engine.ts      Slot generation, hold acquisition, cancellation
├── db.ts                  MySQL pool with mock fallback
├── mock-db.ts             In-memory store
├── migrations.ts          MySQL DDL
├── repos/                 Typed data access layer
├── seed.ts                Auto-seeder (King, services, products, availability)
├── stripe.ts              Stripe wrapper with mock-safe stub
├── types.ts               Domain types
└── validators.ts          Zod schemas

scripts/
└── migrate.ts             MySQL migration runner
```

## Environment Variables

All variables are optional in dev — the app falls back to mock implementations when keys are missing.

```bash
# Database (optional — mock DB used when missing)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=king_fitness

# Stripe (optional — mock checkout used when missing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
APP_URL=http://localhost:3000
BOOKING_HOLD_MINUTES=10
PROVIDER_USER_EMAIL=king@kingfitness.com
```

## Booking Flow Overview

1. Customer browses services on `/services`
2. Picks a service → calendar opens
3. Selects a date → time slots load from `/api/availability/[providerId]`
4. Picks a slot → `POST /api/bookings/hold` acquires a 10-minute hold (server-side unique slot key prevents races)
5. Reviews + confirms → `POST /api/bookings` creates the booking with server-authoritative pricing and a payment intent
6. Hold is released; confirmation page shows next steps
7. Cancellation respects the 24-hour cutoff and triggers a refund record

## Security & Compliance

- **Server-authoritative pricing** — the API never trusts client-supplied amounts; prices are looked up from the DB before charging
- **Race-safe holds** — unique `slot_key` enforced at the data layer; first writer wins
- **Webhook idempotency** — Stripe webhooks check `stripe_payment_intent_id` uniqueness
- **Rate limiting** — public endpoints capped per-IP (login, register, newsletter, exports)
- **Audit log** — every admin action and security-relevant event recorded immutably
- **GDPR** — cookie consent banner with granular opt-in, account export as JSON, soft-delete with PII anonymization, retention of transactions for accounting

## Deployment

This app deploys cleanly to Vercel, Railway, Fly.io, or any Node host. For production:

1. Set all env vars (DB, Stripe) in your platform
2. Run `npm run db:migrate` to create the MySQL schema
3. Configure the Stripe webhook endpoint to `<your-domain>/api/webhooks/stripe`
4. Set `NODE_ENV=production` to disable dev-only conveniences (e.g. password reset URL in API response)

## License

All rights reserved.
