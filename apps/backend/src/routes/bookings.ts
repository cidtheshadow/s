import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { createBookingSchema } from '@kisanify/shared';
import { getSupabaseServiceClient, getSupabaseAnonClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const bookingsRouter = new Hono<AppContext>();

// Create a new slot booking
bookingsRouter.post('/', async (c) => {
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
  const parsed = createBookingSchema.parse(body);

  const supabaseService = getSupabaseServiceClient(c.env);

  // Check slot availability
  const { data: slot, error: slotError } = await supabaseService
    .from('slots')
    .select('*')
    .eq('id', parsed.slot_id)
    .single();

  if (slotError || !slot) {
    return c.json(formatErrorResponse('SLOT_NOT_FOUND', 'Selected slot does not exist'), 404);
  }

  if (slot.booked_count >= slot.capacity) {
    return c.json(formatErrorResponse('SLOT_FULL', 'Selected slot is fully booked'), 400);
  }

  // Generate unique token number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const tokenNumber = `KS-${new Date().getFullYear()}-${randomNum}`;

  // Insert Booking
  const { data: booking, error: bookingError } = await supabaseService
    .from('bookings')
    .insert({
      farmer_id: user.id,
      slot_id: parsed.slot_id,
      centre_id: parsed.centre_id,
      crop: parsed.crop,
      expected_quantity_qtl: parsed.expected_quantity_qtl,
      status: 'BOOKED',
      token_number: tokenNumber
    })
    .select(`
      *,
      centre:centres(name, district, state),
      slot:slots(date, start_time, end_time)
    `)
    .single();

  if (bookingError) {
    return c.json(formatErrorResponse('DB_ERROR', bookingError.message), 500);
  }

  // Increment booked_count on slot
  await supabaseService
    .from('slots')
    .update({ booked_count: slot.booked_count + 1 })
    .eq('id', parsed.slot_id);

  // Create initial queue entry
  const { count } = await supabaseService
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('centre_id', parsed.centre_id);

  const queuePosition = (count || 0) + 1;
  const estimatedWait = queuePosition * 12; // 12 mins per turn baseline

  await supabaseService
    .from('queue_entries')
    .insert({
      booking_id: booking.id,
      centre_id: parsed.centre_id,
      position: queuePosition,
      estimated_wait_minutes: estimatedWait
    });

  return c.json(formatSuccessResponse(booking));
});

// Get farmer's active and past bookings
bookingsRouter.get('/my-bookings', async (c) => {
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
    .from('bookings')
    .select(`
      *,
      centre:centres(name, district, state),
      slot:slots(date, start_time, end_time),
      queue:queue_entries(position, estimated_wait_minutes, checked_in_at),
      events:booking_status_events(status, notes, created_at)
    `)
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});

// Get single booking details with queue status and timeline
bookingsRouter.get('/:id', async (c) => {
  const bookingId = c.req.param('id');
  const supabaseService = getSupabaseServiceClient(c.env);

  const { data, error } = await supabaseService
    .from('bookings')
    .select(`
      *,
      centre:centres(*),
      slot:slots(*),
      queue:queue_entries(*),
      events:booking_status_events(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error || !data) {
    return c.json(formatErrorResponse('NOT_FOUND', 'Booking not found'), 404);
  }

  return c.json(formatSuccessResponse(data));
});
