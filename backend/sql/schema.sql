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
  -- Optional fields used by the frontend detail view
  adults INTEGER DEFAULT 0,
  youth INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  purpose TEXT DEFAULT 'private' CHECK (purpose IN ('private','business')),
  room TEXT
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  nationality_code TEXT NOT NULL CHECK (nationality_code IN ('DE', 'US', 'AT', 'CH')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
