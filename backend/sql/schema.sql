-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('pending', 'started', 'done')),
  booking_nr TEXT NOT NULL,
  guest_email TEXT,
  primary_guest_name TEXT,
  booking_id TEXT,
  room_name TEXT,
  booking_from TIMESTAMPTZ NOT NULL,
  booking_to TIMESTAMPTZ NOT NULL,
  check_in_via TEXT CHECK (check_in_via IN ('android', 'ios', 'tv', 'station', 'web')),
  check_out_via TEXT CHECK (check_out_via IN ('android', 'ios', 'tv', 'station', 'web')),
  last_opened_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_url TEXT,
  balance NUMERIC(10,2) DEFAULT '0',
  adults INTEGER DEFAULT 0,
  youth INTEGER DEFAULT 0,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,
  purpose TEXT DEFAULT 'private' CHECK (purpose IN ('private', 'business')),
  room TEXT
);

CREATE INDEX IF NOT EXISTS reservations_state_idx ON reservations (state);
CREATE INDEX IF NOT EXISTS reservations_received_at_idx ON reservations (received_at);
CREATE INDEX IF NOT EXISTS reservations_booking_from_idx ON reservations (booking_from);
CREATE INDEX IF NOT EXISTS reservations_booking_to_idx ON reservations (booking_to);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  nationality_code TEXT NOT NULL CHECK (nationality_code IN ('DE', 'US', 'AT', 'CH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS guests_reservation_id_idx ON guests (reservation_id);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('demo', 'production', 'staging', 'template')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  country_code TEXT,
  selected_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at);
CREATE INDEX IF NOT EXISTS users_selected_property_id_idx ON users (selected_property_id);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number TEXT,
  room_type TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'out_of_order')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rooms_property_id_idx ON rooms (property_id);
CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms (status);

-- Monitoring logs table
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('pms', 'door lock', 'payment')),
  booking_nr TEXT,
  event TEXT NOT NULL,
  sub TEXT,
  log_message TEXT
);

CREATE INDEX IF NOT EXISTS monitoring_logs_status_idx ON monitoring_logs (status);
CREATE INDEX IF NOT EXISTS monitoring_logs_type_idx ON monitoring_logs (type);
CREATE INDEX IF NOT EXISTS monitoring_logs_logged_at_idx ON monitoring_logs (logged_at);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- User-Roles junction table (composite primary key)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON user_roles (role_id);
