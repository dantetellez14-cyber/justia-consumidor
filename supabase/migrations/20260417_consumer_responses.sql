-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: consumer_responses
-- Bidirectional messaging between consumer and empresa.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consumer_responses (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id          UUID        NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id          TEXT        NOT NULL,
  tipo_respuesta   TEXT        NOT NULL CHECK (tipo_respuesta IN ('aceptar', 'rechazar', 'contraofertar', 'mensaje')),
  mensaje          TEXT        NOT NULL CHECK (char_length(mensaje) >= 5),
  monto_contraoferta NUMERIC(12, 2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups per case (sorted by time)
CREATE INDEX IF NOT EXISTS consumer_responses_case_id_idx
  ON consumer_responses (case_id, created_at ASC);

-- Index for ownership checks
CREATE INDEX IF NOT EXISTS consumer_responses_user_id_idx
  ON consumer_responses (user_id);

-- RLS: consumers can only read/write their own responses
ALTER TABLE consumer_responses ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used in API routes)
-- Consumer can insert their own replies
CREATE POLICY "consumer_responses_insert_own"
  ON consumer_responses FOR INSERT
  WITH CHECK (true); -- enforced in API layer via Clerk auth

-- Consumer can read replies on their own cases
CREATE POLICY "consumer_responses_select_own"
  ON consumer_responses FOR SELECT
  USING (true); -- enforced in API layer (join filtered by case ownership)
