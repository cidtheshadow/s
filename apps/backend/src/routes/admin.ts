// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const adminRouter = new Hono<AppContext>();

// Get overall procurement analytics and centre-wise stats
adminRouter.get('/stats', async (c) => {
  const supabase = getSupabaseServiceClient(c.env);

  const [centresRes, bookingsRes, grievancesRes] = await Promise.all([
    supabase.from('centres').select('*'),
    supabase.from('bookings').select('*, queue:queue_entries(estimated_wait_minutes)'),
    supabase.from('grievances').select('*')
  ]);

  if (centresRes.error) return c.json(formatErrorResponse('DB_ERROR', centresRes.error.message), 500);

  const centres = centresRes.data || [];
  const bookings = bookingsRes.data || [];
  const grievances = grievancesRes.data || [];

  const totalBookings = bookings.length;
  const procuredCount = bookings.filter(b => ['PROCURED', 'PAYMENT_INITIATED', 'PAID'].includes(b.status)).length;
  const noShowCount = bookings.filter(b => b.status === 'NO_SHOW').length;
  const noShowRatePct = totalBookings > 0 ? Number(((noShowCount / totalBookings) * 100).toFixed(1)) : 0;

  // Centre-wise aggregation
  const centreStats = centres.map(centre => {
    const centreBookings = bookings.filter(b => b.centre_id === centre.id);
    const centreProcured = centreBookings.filter(b => ['PROCURED', 'PAYMENT_INITIATED', 'PAID'].includes(b.status));
    const totalProcuredQtl = centreProcured.reduce((sum, b) => sum + Number(b.expected_quantity_qtl || 0), 0);
    const avgWait = centreBookings.length > 0 ? Math.round(centreBookings.reduce((sum, b) => sum + (b.queue?.estimated_wait_minutes || 20), 0) / centreBookings.length) : 15;

    return {
      id: centre.id,
      name: centre.name,
      district: centre.district,
      daily_capacity: centre.daily_capacity,
      booked_today: centreBookings.length,
      procured_qtl: totalProcuredQtl,
      avg_wait_minutes: avgWait,
      capacity_utilized_pct: Math.min(100, Math.round((centreBookings.length / (centre.daily_capacity || 1)) * 100))
    };
  });

  return c.json(formatSuccessResponse({
    overview: {
      total_centres: centres.length,
      total_bookings: totalBookings,
      procured_bookings: procuredCount,
      no_show_rate_pct: noShowRatePct,
      open_grievances: grievances.filter(g => g.status === 'OPEN').length
    },
    centre_stats: centreStats
  }));
});

// Get Grievances queue with SLA timer calculation (24h SLA target)
adminRouter.get('/grievances', async (c) => {
  const supabase = getSupabaseServiceClient(c.env);

  const { data: grievances, error } = await supabase
    .from('grievances')
    .select(`
      *,
      farmer:farmers(name, phone, village)
    `)
    .order('created_at', { ascending: true });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  const enriched = (grievances || []).map(g => {
    const createdAtMs = new Date(g.created_at).getTime();
    const nowMs = Date.now();
    const elapsedHours = (nowMs - createdAtMs) / (1000 * 60 * 60);
    const slaRemainingHours = Math.max(0, 24 - elapsedHours);
    const isSlaBreached = elapsedHours > 24 && g.status === 'OPEN';

    return {
      ...g,
      sla: {
        target_hours: 24,
        elapsed_hours: Number(elapsedHours.toFixed(1)),
        remaining_hours: Number(slaRemainingHours.toFixed(1)),
        is_breached: isSlaBreached
      }
    };
  });

  return c.json(formatSuccessResponse(enriched));
});

// Resolve a grievance ticket
adminRouter.post('/grievances/:id/resolve', async (c) => {
  const grievanceId = c.req.param('id');
  const body = await c.req.json();
  const resolutionText = body.resolution || 'Resolved by mandi administration';

  const supabase = getSupabaseServiceClient(c.env);
  const { data, error } = await supabase
    .from('grievances')
    .update({
      status: 'RESOLVED',
      resolution: resolutionText
    })
    .eq('id', grievanceId)
    .select()
    .single();

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});
