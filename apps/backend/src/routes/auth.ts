import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { requestOtpSchema, verifyOtpSchema } from '@kisanify/shared';
import { getSupabaseAnonClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const authRouter = new Hono<AppContext>();

authRouter.post('/request-otp', async (c) => {
  const body = await c.req.json();
  const parsed = requestOtpSchema.parse(body);

  const supabase = getSupabaseAnonClient(c.env);
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.phone
  });

  if (error) {
    return c.json(formatErrorResponse('OTP_REQUEST_FAILED', error.message), 400);
  }

  return c.json(formatSuccessResponse({
    message: 'OTP sent successfully to ' + parsed.phone,
    phone: parsed.phone
  }));
});

authRouter.post('/verify-otp', async (c) => {
  const body = await c.req.json();
  const parsed = verifyOtpSchema.parse(body);

  const supabase = getSupabaseAnonClient(c.env);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: parsed.phone,
    token: parsed.token,
    type: 'sms'
  });

  if (error || !data.session) {
    return c.json(formatErrorResponse('OTP_VERIFY_FAILED', error?.message || 'Invalid or expired OTP'), 400);
  }

  return c.json(formatSuccessResponse({
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at
  }));
});
