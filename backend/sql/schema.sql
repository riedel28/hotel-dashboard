-- Minimal schema for reservations used by the frontend
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('pending','started','done')),
  booking_nr TEXT,
  guest_email TEXT,
  primary_guest_name TEXT,
  booking_id TEXT,
  room_name TEXT,
  booking_from TIMESTAMPTZ,
  booking_to TIMESTAMPTZ,
  check_in_via TEXT CHECK (check_in_via IN ('android','ios','tv','station','web')),
  check_out_via TEXT CHECK (check_out_via IN ('android','ios','tv','station','web')),
  last_opened_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  page_url TEXT,
  balance DOUBLE PRECISION DEFAULT 0,
  guests JSONB DEFAULT '[]'::jsonb,
  -- Optional fields used by the frontend detail view
  adults INTEGER DEFAULT 0,
  youth INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  purpose TEXT DEFAULT 'private' CHECK (purpose IN ('private','business')),
  room TEXT
);


