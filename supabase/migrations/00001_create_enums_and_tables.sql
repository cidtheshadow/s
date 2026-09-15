-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Booking Status Enum
CREATE TYPE booking_status_enum AS ENUM (
  'BOOKED',
  'ARRIVED',
  'QUALITY_CHECKED',
  'PROCURED',
  'PAYMENT_INITIATED',
  'PAID',
  'CANCELLED',
  'NO_SHOW'
);

-- Farmers table
CREATE TABLE farmers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'hi',
  land_size_acres NUMERIC(10, 2) NOT NULL DEFAULT 0,
  crop_types TEXT[] NOT NULL DEFAULT '{}',
  aadhaar_ref_masked TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Centres table
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  daily_capacity INT NOT NULL DEFAULT 100,
  operating_hours JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Slots table
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL,
  booked_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slot_centre_time_unique UNIQUE(centre_id, date, start_time)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  expected_quantity_qtl NUMERIC(10, 2) NOT NULL,
  status booking_status_enum NOT NULL DEFAULT 'BOOKED',
  token_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Status Events (Append-only Audit Trail)
CREATE TABLE booking_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status booking_status_enum NOT NULL,
  actor_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Queue Entries
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  position INT NOT NULL,
  estimated_wait_minutes INT NOT NULL,
  checked_in_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ
);

-- Prices table
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop TEXT NOT NULL,
  mandi TEXT NOT NULL,
  state TEXT NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  msp NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL
);

-- Grievances table
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications Log
CREATE TABLE notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'SENT',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
