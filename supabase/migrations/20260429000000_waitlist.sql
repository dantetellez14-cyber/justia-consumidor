-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: waitlist
-- Description: Pre-launch email capture for /proximamente landing.
--              Stores email + country preference + traffic source.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  pais TEXT NOT NULL CHECK (pais IN ('AR', 'MX')),
  source TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_pais ON waitlist(pais);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable RLS — only the service role (server-side) can read/write.
-- The /api/waitlist endpoint uses the secret key, bypassing RLS.
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- No public policies: client-side cannot read this table directly.
-- Counts for "X people waiting" are exposed via /api/waitlist GET (server-aggregated).
