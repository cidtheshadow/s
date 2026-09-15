import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { updateBookingStatusSchema } from '@kisanify/shared';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const officerRouter = new Hono<AppContext>();

// Get today's queue entries for a specific centre (or default centre)
officerRouter.get('/queue', async (c) => {
  const centreId = c.req.query('centre_id') || '11111111-1111-1111-1111-111111111111';
  const supabase = getSupabaseServiceClient(c.env);

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      farmer:farmers(name, phone, village),
      slot:slots(start_time, end_time),
      queue:queue_entries(position, estimated_wait_minutes, checked_in_at),
      events:booking_status_events(status, notes, created_at)
    `)
    .eq('centre_id', centreId)
    .order('created_at', { ascending: true });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(data));
});

// Check-in farmer by token number (advance BOOKED -> ARRIVED)
officerRouter.post('/check-in', async (c) => {
  const body = await c.req.json();
  const tokenNumber = body.token_number;

  if (!tokenNumber) {
    return c.json(formatErrorResponse('VALIDATION_ERROR', 'Token number is required'), 400);
  }

  const supabase = getSupabaseServiceClient(c.env);

  // Find booking
  const { data: booking, error: findError } = await supabase
    .from('bookings')
    .select('*')
    .eq('token_number', tokenNumber.trim())
    .single();

  if (findError || !booking) {
    return c.json(formatErrorResponse('NOT_FOUND', 'Invalid or unrecognised token number'), 404);
  }

  if (booking.status !== 'BOOKED') {
    return c.json(formatErrorResponse('INVALID_STATE', `Booking is already in ${booking.status} status`), 400);
  }

  // Update status to ARRIVED
  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'ARRIVED' })
    .eq('id', booking.id)
    .select()
    .single();

  if (updateError) {
    return c.json(formatErrorResponse('DB_ERROR', updateError.message), 500);
  }

  // Update checked_in_at in queue_entries
  await supabase
    .from('queue_entries')
    .update({ checked_in_at: new Date().toISOString() })
    .eq('booking_id', booking.id);

  return c.json(formatSuccessResponse({
    booking: updated,
    message: `Farmer ${tokenNumber} checked in successfully!`
  }));
});

// Record Quality Check results (advance ARRIVED -> QUALITY_CHECKED)
officerRouter.post('/quality-check', async (c) => {
  const body = await c.req.json();
  const { booking_id, moisture_pct, foreign_matter_pct, grade, reason } = body;

  if (!booking_id || moisture_pct === undefined || foreign_matter_pct === undefined || !grade) {
    return c.json(formatErrorResponse('VALIDATION_ERROR', 'Missing required quality check fields'), 400);
  }

  const supabase = getSupabaseServiceClient(c.env);

  const notesText = `Quality Inspection: Moisture=${moisture_pct}%, ForeignMatter=${foreign_matter_pct}%, Grade=${grade}. ${reason || ''}`;

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status: 'QUALITY_CHECKED' })
    .eq('id', booking_id)
    .select()
    .single();

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  // Update notes on the last status event
  await supabase
    .from('booking_status_events')
    .insert({
      booking_id,
      status: 'QUALITY_CHECKED',
      notes: notesText
    });

  return c.json(formatSuccessResponse({
    booking: updated,
    notes: notesText
  }));
});

// Advance booking status (PROCURED, PAYMENT_INITIATED, PAID, CANCELLED, NO_SHOW)
officerRouter.post('/advance-status', async (c) => {
  const body = await c.req.json();
  const parsed = updateBookingStatusSchema.parse(body);

  const supabase = getSupabaseServiceClient(c.env);
  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status: parsed.status })
    .eq('id', parsed.booking_id)
    .select()
    .single();

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  return c.json(formatSuccessResponse(updated));
});
