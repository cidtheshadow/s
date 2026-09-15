-- Enable RLS on all tables
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- 1. Farmers RLS: Farmer reads/updates own profile. Service role bypasses.
CREATE POLICY farmers_select_own ON farmers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY farmers_insert_own ON farmers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY farmers_update_own ON farmers
  FOR UPDATE USING (auth.uid() = id);

-- 2. Centres RLS: Publicly readable by all authenticated users.
CREATE POLICY centres_select_all ON centres
  FOR SELECT USING (true);

-- 3. Slots RLS: Publicly readable by all authenticated users.
CREATE POLICY slots_select_all ON slots
  FOR SELECT USING (true);

-- 4. Bookings RLS: Farmer reads/inserts own bookings.
CREATE POLICY bookings_select_own ON bookings
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY bookings_insert_own ON bookings
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY bookings_update_own ON bookings
  FOR UPDATE USING (auth.uid() = farmer_id);

-- 5. Booking Status Events RLS: Readable by booking owner.
CREATE POLICY status_events_select_own ON booking_status_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_status_events.booking_id
      AND b.farmer_id = auth.uid()
    )
  );

-- 6. Queue Entries RLS: Readable by booking owner.
CREATE POLICY queue_select_own ON queue_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = queue_entries.booking_id
      AND b.farmer_id = auth.uid()
    )
  );

-- 7. Prices RLS: Publicly readable.
CREATE POLICY prices_select_all ON prices
  FOR SELECT USING (true);

-- 8. Grievances RLS: Farmer reads/inserts own grievances.
CREATE POLICY grievances_select_own ON grievances
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY grievances_insert_own ON grievances
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 9. Notifications Log RLS: Farmer reads own notifications.
CREATE POLICY notifications_select_own ON notifications_log
  FOR SELECT USING (auth.uid() = farmer_id);
