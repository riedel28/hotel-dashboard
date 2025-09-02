-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  nationality_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Remove guests column from reservations table
ALTER TABLE reservations DROP COLUMN IF EXISTS guests;