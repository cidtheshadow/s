// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { createGrievanceSchema } from '@kisanify/shared';
import { getSupabaseServiceClient, getSupabaseAnonClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const grievancesRouter = new Hono<AppContext>();

grievancesRouter.post('/', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Missing token'), 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAnon = getSupabaseAnonClient(c.env);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

  if (authError || !user) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Invalid user session'), 401);
  }

  const body = await c.req.json();
  const parsed = createGrievanceSchema.parse(body);

  const supabaseService = getSupabaseServiceClient(c.env);
  const { data, error } = await supabaseService
    .from('grievances')
    .insert({
      farmer_id: user.id,
      booking_id: parsed.booking_id || null,
      category: parsed.category,
      description: parsed.description,
      status: 'OPEN'
    })
    .select()
    .single();

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});

grievancesRouter.get('/my-grievances', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Missing token'), 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAnon = getSupabaseAnonClient(c.env);
  const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

  if (authError || !user) {
    return c.json(formatErrorResponse('UNAUTHORIZED', 'Invalid session'), 401);
  }

  const supabaseService = getSupabaseServiceClient(c.env);
  const { data, error } = await supabaseService
    .from('grievances')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});
