import { z } from 'zod';

export const bookingStatusEnum = z.enum([
  'BOOKED',
  'ARRIVED',
  'QUALITY_CHECKED',
  'PROCURED',
  'PAYMENT_INITIATED',
  'PAID',
  'CANCELLED',
  'NO_SHOW'
]);

export const languageCodeEnum = z.enum(['hi', 'pa', 'en', 'mr', 'te', 'bn']);

export const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+91[0-9]{10}$/, 'Phone must be a valid 10-digit Indian number with +91 prefix')
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91[0-9]{10}$/),
  token: z.string().length(6, 'OTP must be 6 digits')
});

export const createFarmerProfileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  village: z.string().min(2, 'Village is required'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  preferred_language: languageCodeEnum,
  land_size_acres: z.number().positive('Land size must be greater than 0'),
  crop_types: z.array(z.string()).min(1, 'Select at least one crop'),
  aadhaar_ref_masked: z.string().optional()
});

export const createBookingSchema = z.object({
  centre_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  crop: z.string().min(2),
  expected_quantity_qtl: z.number().positive('Quantity must be greater than 0')
});

export const updateBookingStatusSchema = z.object({
  booking_id: z.string().uuid(),
  status: bookingStatusEnum,
  notes: z.string().optional(),
  quality_check: z.object({
    moisture_pct: z.number().min(0).max(100),
    foreign_matter_pct: z.number().min(0).max(100),
    grade: z.enum(['A', 'B', 'C', 'REJECTED']),
    reason: z.string().optional()
  }).optional()
});

export const createGrievanceSchema = z.object({
  booking_id: z.string().uuid().optional(),
  category: z.enum(['SLOT_DELAY', 'QUALITY_DISPUTE', 'PAYMENT_DELAY', 'OFFICER_BEHAVIOR', 'OTHER']),
  description: z.string().min(10, 'Please describe your grievance in at least 10 characters')
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreateFarmerProfileInput = z.infer<typeof createFarmerProfileSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CreateGrievanceInput = z.infer<typeof createGrievanceSchema>;
