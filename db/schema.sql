-- Schemat bazy dla systemu rezerwacji (Supabase)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer','owner','admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled','failed')),
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  EXCLUDE USING gist (
    room_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('pending','paid'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','staff')),
  token TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
