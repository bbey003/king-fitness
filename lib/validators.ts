import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email').max(255),
  password: z.string().min(8, 'Min 8 characters').max(128),
  display_name: z.string().trim().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().trim().email(),
});

export const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email(),
  privacy_accepted: z.boolean().refine((v) => v === true, {
    message: 'You must accept the privacy policy',
  }),
});

export const holdSchema = z.object({
  service_id: z.string().min(1),
  start_at: z.string().min(1),
});

export const bookingCreateSchema = z.object({
  service_id: z.string().min(1),
  start_at: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const availabilityRulesSchema = z.object({
  rules: z.array(
    z.object({
      day_of_week: z.number().int().min(0).max(6),
      start_time: z.string().regex(/^\d{2}:\d{2}$/),
      end_time: z.string().regex(/^\d{2}:\d{2}$/),
      is_active: z.boolean(),
    })
  ),
});

export const overrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_blocked: z.boolean(),
  note: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  type: z.enum(['products', 'service']),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .optional(),
  service_id: z.string().optional(),
  start_at: z.string().optional(),
  shipping_address: z
    .object({
      name: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
});

export const verifyStartSchema = z.object({
  type: z.enum([
    'government_id',
    'phone',
    'email',
    'selfie',
    'business_license',
    'professional_cert',
  ]),
});

export const verifySubmitSchema = z.object({
  document_urls: z.array(z.string()).min(1),
  document_type: z.string().min(1),
});

export const verifyReviewSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const adminUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z.string().max(500).optional(),
});
