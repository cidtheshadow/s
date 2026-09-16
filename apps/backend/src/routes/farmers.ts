// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { createFarmerProfileSchema } from '@kisanify/shared';
import { getSupabaseServiceClient, getSupabaseAnonClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const farmersRouter = new Hono<AppContext>();

// Get or Create profile for current authenticated user
farmersRouter.post('/profile', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Missing Authorization header'), 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAnon = getSupabaseAnonClient(c.env);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

  if (authError || !user) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Invalid session or token'), 401);
  }

  const body = await c.req.json();
  const parsed = createFarmerProfileSchema.parse(body);

  const supabaseService = getSupabaseServiceClient(c.env);
  const { data, error } = await supabaseService
    .from('farmers')
    .upsert({
      id: user.id,
      phone: user.phone || parsed.aadhaar_ref_masked || '+910000000000',
      name: parsed.name,
      village: parsed.village,
      district: parsed.district,
      state: parsed.state,
      preferred_language: parsed.preferred_language,
      land_size_acres: parsed.land_size_acres,
      crop_types: parsed.crop_types,
      aadhaar_ref_masked: parsed.aadhaar_ref_masked ? `XXXX-XXXX-${parsed.aadhaar_ref_masked.slice(-4)}` : null
    })
    .select()
    .single();

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});

// Get current farmer profile
farmersRouter.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Missing Authorization header'), 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAnon = getSupabaseAnonClient(c.env);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

  if (authError || !user) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Invalid session'), 401);
  }

  const supabaseService = getSupabaseServiceClient(c.env);
  const { data: farmer, error } = await supabaseService
    .from('farmers')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(farmer || null));
});
