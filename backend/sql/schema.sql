-- Minimal schema for reservations used by the frontend
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('pending','started','done')),
  booking_nr TEXT,
  guest_email TEXT,
  primary_guest_name TEXT,
  booking_id TEXT,
  room_name TEXT,
  booking_from DATE,
  booking_to DATE,
  check_in_via TEXT,
  check_out_via TEXT,
  last_opened_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  page_url TEXT,
  balance NUMERIC,
  guests JSONB DEFAULT '[]'::jsonb
);


