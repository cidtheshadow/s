-- Seed Centres
INSERT INTO centres (id, name, district, state, lat, lng, daily_capacity, operating_hours) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Khanna Grain Mandi Procurement Centre', 'Ludhiana', 'Punjab', 30.7046, 76.2201, 150, '{"start": "08:00", "end": "18:00"}'),
  ('22222222-2222-2222-2222-222222222222', 'Karnal Anaj Mandi Centre', 'Karnal', 'Haryana', 29.6857, 76.9905, 120, '{"start": "08:30", "end": "17:30"}'),
  ('33333333-3333-3333-3333-333333333333', 'Hoshangabad Krishi Upaj Mandi', 'Narmadapuram', 'Madhya Pradesh', 22.7519, 77.7289, 100, '{"start": "09:00", "end": "17:00"}'),
  ('44444444-4444-4444-4444-444444444444', 'Latur APMC Procurement Hub', 'Latur', 'Maharashtra', 18.4088, 76.5604, 90, '{"start": "09:00", "end": "16:30"}'),
  ('55555555-5555-5555-5555-555555555555', 'Bareilly Grain Mandi', 'Bareilly', 'Uttar Pradesh', 28.3670, 79.4304, 110, '{"start": "08:30", "end": "17:00"}')
ON CONFLICT (id) DO NOTHING;

-- Seed Prices (Recent 7-day history per crop)
INSERT INTO prices (crop, mandi, state, modal_price, min_price, max_price, msp, date) VALUES
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2275.00, 2200.00, 2350.00, 2275.00, CURRENT_DATE),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2260.00, 2190.00, 2340.00, 2275.00, CURRENT_DATE - INTERVAL '1 day'),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2250.00, 2180.00, 2330.00, 2275.00, CURRENT_DATE - INTERVAL '2 day'),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2240.00, 2175.00, 2320.00, 2275.00, CURRENT_DATE - INTERVAL '3 day'),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2235.00, 2170.00, 2310.00, 2275.00, CURRENT_DATE - INTERVAL '4 day'),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2220.00, 2160.00, 2300.00, 2275.00, CURRENT_DATE - INTERVAL '5 day'),
  ('Wheat (गेहूं)', 'Khanna Grain Mandi', 'Punjab', 2210.00, 2150.00, 2290.00, 2275.00, CURRENT_DATE - INTERVAL '6 day'),

  ('Paddy (धान)', 'Karnal Anaj Mandi', 'Haryana', 2183.00, 2100.00, 2250.00, 2183.00, CURRENT_DATE),
  ('Paddy (धान)', 'Karnal Anaj Mandi', 'Haryana', 2175.00, 2090.00, 2240.00, 2183.00, CURRENT_DATE - INTERVAL '1 day'),

  ('Mustard (सरसों)', 'Bareilly Grain Mandi', 'Uttar Pradesh', 5650.00, 5400.00, 5800.00, 5650.00, CURRENT_DATE),
  ('Gram (चना)', 'Hoshangabad Mandi', 'Madhya Pradesh', 5440.00, 5200.00, 5600.00, 5440.00, CURRENT_DATE),
  ('Cotton (कपास)', 'Latur APMC', 'Maharashtra', 7020.00, 6800.00, 7250.00, 7020.00, CURRENT_DATE);

-- Seed slots for the next 7 days for Khanna Centre
INSERT INTO slots (centre_id, date, start_time, end_time, capacity, booked_count) VALUES
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, '09:00', '10:00', 15, 12),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, '10:00', '11:00', 15, 15),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, '11:00', '12:00', 15, 8),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, '14:00', '15:00', 15, 5),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', '09:00', '10:00', 15, 2),
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 15, 0)
ON CONFLICT (centre_id, date, start_time) DO NOTHING;
