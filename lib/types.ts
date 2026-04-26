// ───────── Auth ─────────
export type UserRole = 'user' | 'provider' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  email_verified_at: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// ───────── Bookings ─────────
export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  session_count: number;
  duration_minutes: number;
  price_cents: number;
  buffer_after_minutes: number;
  max_advance_days: number;
  cancellation_cutoff_hours: number;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityRule {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 = Sunday … 6 = Saturday
  start_time: string;  // "HH:MM"
  end_time: string;    // "HH:MM"
  is_active: boolean;
}

export interface AvailabilityOverride {
  id: string;
  provider_id: string;
  date: string; // YYYY-MM-DD
  is_blocked: boolean;
  note: string | null;
}

export interface BookingHold {
  id: string;
  slot_key: string;
  provider_id: string;
  service_id: string;
  user_id: string | null;
  start_at: string;
  end_at: string;
  held_by_ip: string | null;
  expires_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled_user'
  | 'cancelled_provider'
  | 'completed'
  | 'no_show';

export interface Booking {
  id: string;
  user_id: string;
  provider_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  notes: string | null;
  price_cents: number;
  sessions_remaining: number;
  stripe_payment_intent_id: string | null;
  cancellation_reason: string | null;
  refund_status: string | null;
  created_at: string;
  updated_at: string;
}

// ───────── Products ─────────
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

// ───────── Orders ─────────
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  shipping_address: ShippingAddress | null;
  created_at: string;
  items?: OrderItem[];
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ───────── Payments ─────────
export interface PaymentIntentRow {
  id: string;
  stripe_payment_intent_id: string | null;
  user_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  payment_intent_id: string | null;
  type: 'charge' | 'refund';
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  description: string | null;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  created_at: string;
}

// ───────── Cart (client-side) ─────────
export interface CartLine {
  product_id: string;
  slug: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
  image_url: string | null;
}

// ───────── Verifications ─────────
export type VerificationType =
  | 'government_id'
  | 'phone'
  | 'email'
  | 'selfie'
  | 'business_license'
  | 'professional_cert';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface Verification {
  id: string;
  user_id: string;
  type: VerificationType;
  status: VerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  document_type: string | null;
  document_urls: string[];
  expiry_date: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ───────── Audit ─────────
export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ───────── Newsletter ─────────
export interface NewsletterSubscriber {
  id: string;
  email: string;
  consented_at: string;
  unsubscribed_at: string | null;
  ip_address: string | null;
}
