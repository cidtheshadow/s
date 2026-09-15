import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const centresRouter = new Hono<AppContext>();

centresRouter.get('/', async (c) => {
  const supabase = getSupabaseServiceClient(c.env);
  const { data, error } = await supabase
    .from('centres')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});

centresRouter.get('/:id/slots', async (c) => {
  const centreId = c.req.param('id');
  const supabase = getSupabaseServiceClient(c.env);

  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('centre_id', centreId)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});
