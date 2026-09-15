-- Status transition enforcement trigger function
CREATE OR REPLACE FUNCTION enforce_booking_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  old_rank INT;
  new_rank INT;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Map statuses to rank
  CASE OLD.status
    WHEN 'BOOKED' THEN old_rank := 1;
    WHEN 'ARRIVED' THEN old_rank := 2;
    WHEN 'QUALITY_CHECKED' THEN old_rank := 3;
    WHEN 'PROCURED' THEN old_rank := 4;
    WHEN 'PAYMENT_INITIATED' THEN old_rank := 5;
    WHEN 'PAID' THEN old_rank := 6;
    WHEN 'CANCELLED' THEN old_rank := 99;
    WHEN 'NO_SHOW' THEN old_rank := 99;
  END CASE;

  CASE NEW.status
    WHEN 'BOOKED' THEN new_rank := 1;
    WHEN 'ARRIVED' THEN new_rank := 2;
    WHEN 'QUALITY_CHECKED' THEN new_rank := 3;
    WHEN 'PROCURED' THEN new_rank := 4;
    WHEN 'PAYMENT_INITIATED' THEN new_rank := 5;
    WHEN 'PAID' THEN new_rank := 6;
    WHEN 'CANCELLED' THEN new_rank := 99;
    WHEN 'NO_SHOW' THEN new_rank := 99;
  END CASE;

  -- Handle terminal cancellations / no-shows
  IF NEW.status IN ('CANCELLED', 'NO_SHOW') THEN
    IF OLD.status IN ('BOOKED', 'ARRIVED') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Cannot cancel or mark no-show for booking in % status', OLD.status;
    END IF;
  END IF;

  -- Enforce strictly forward progress
  IF new_rank <= old_rank THEN
    RAISE EXCEPTION 'Invalid status transition from % to %: status can only move forward', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_booking_status_transition_trigger
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION enforce_booking_status_transition();

-- Automatic status event logger
CREATE OR REPLACE FUNCTION log_booking_status_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO booking_status_events (booking_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Booking created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_events (booking_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || OLD.status::text || ' to ' || NEW.status::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_booking_status_event_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_booking_status_event();
