-- Migrations for travel-vietnam
-- apply with: wrangler d1 migrations apply travel-db --local / --remote

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  country TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS days (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES trips(id),
  date TEXT,
  base TEXT,
  emoji TEXT,
  plan TEXT,
  data TEXT,
  sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  day_id TEXT REFERENCES days(id),
  name TEXT,
  kind TEXT,
  url TEXT,
  r2_key TEXT
);
