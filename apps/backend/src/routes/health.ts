import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { formatSuccessResponse } from '../middleware/error.js';

export const healthRouter = new Hono<AppContext>();

healthRouter.get('/', async (c) => {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbError: string | null = null;

  try {
    const supabase = getSupabaseServiceClient(c.env);
    const { error } = await supabase.from('centres').select('id').limit(1);
    if (error) {
      dbStatus = 'degraded';
      dbError = error.message;
    }
  } catch (err: any) {
    dbStatus = 'unreachable';
    dbError = err.message;
  }

  const response = formatSuccessResponse({
    service: 'Kisanify Cloudflare Worker API',
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - startTime,
    database: {
      status: dbStatus,
      error: dbError
    }
  });

  return c.json(response);
});
