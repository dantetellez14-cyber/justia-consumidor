-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: user_analytics
-- Tracks user sessions, token consumption, and aggregated user metrics.
-- Executed: 2026-04-24
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. user_sessions ──────────────────────────────────────────────────────────
-- One row per visit. Duration computed on session_end.

CREATE TABLE IF NOT EXISTS user_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT,                        -- Clerk userId (NULL = anon)
  email            TEXT,                        -- Clerk email (NULL = anon)
  session_start    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end      TIMESTAMPTZ,
  duration_seconds INT GENERATED ALWAYS AS (
    CASE
      WHEN session_end IS NOT NULL
      THEN EXTRACT(EPOCH FROM (session_end - session_start))::INT
      ELSE NULL
    END
  ) STORED,
  -- Device / location metadata
  ip               TEXT,
  user_agent       TEXT,
  country          TEXT,                        -- from Vercel header x-vercel-ip-country
  device_type      TEXT CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  -- Page activity
  pages_visited    INT         NOT NULL DEFAULT 1,
  last_page        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id    ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start      ON user_sessions (session_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country    ON user_sessions (country);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
-- Only service role writes; no anon access
CREATE POLICY "no_anon_sessions" ON user_sessions FOR ALL TO anon USING (false);


-- ── 2. token_usage ────────────────────────────────────────────────────────────
-- One row per AI API call. Supports Gemini + Ollama (estimated for local).

CREATE TABLE IF NOT EXISTS token_usage (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT,                        -- Clerk userId (NULL = anon)
  session_id       UUID        REFERENCES user_sessions(id) ON DELETE SET NULL,
  case_id          UUID,                        -- references cases(id) if available
  route            TEXT        NOT NULL,        -- e.g. '/api/analyze', '/api/arbitrate'
  model            TEXT        NOT NULL,        -- e.g. 'gemini-1.5-flash', 'gemma2:9b'
  provider         TEXT        NOT NULL CHECK (provider IN ('gemini','ollama','pinecone','demo')),
  input_tokens     INT         NOT NULL DEFAULT 0,
  output_tokens    INT         NOT NULL DEFAULT 0,
  total_tokens     INT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  -- Cost estimate in USD (Gemini 1.5 Flash: $0.075/1M input, $0.30/1M output)
  estimated_cost_usd NUMERIC(10,6) GENERATED ALWAYS AS (
    CASE
      WHEN provider = 'gemini'
      THEN (input_tokens * 0.000000075) + (output_tokens * 0.0000003)
      ELSE 0
    END
  ) STORED,
  latency_ms       INT,
  success          BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_usage_user_id    ON token_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_route      ON token_usage (route);
CREATE INDEX IF NOT EXISTS idx_token_usage_created    ON token_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_provider   ON token_usage (provider);

ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_anon_token_usage" ON token_usage FOR ALL TO anon USING (false);


-- ── 3. user_analytics view ────────────────────────────────────────────────────
-- Aggregates all metrics per user for the admin dashboard.

CREATE OR REPLACE VIEW user_analytics AS
SELECT
  COALESCE(s.user_id, t.user_id, 'anon')       AS user_id,
  s.email,
  -- Session metrics
  COUNT(DISTINCT s.id)                           AS total_sessions,
  MIN(s.session_start)                           AS first_seen,
  MAX(s.session_start)                           AS last_seen,
  ROUND(AVG(s.duration_seconds)::NUMERIC, 0)    AS avg_session_duration_s,
  SUM(s.duration_seconds)                        AS total_time_s,
  -- Case metrics
  COUNT(DISTINCT c.id)                           AS total_cases,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'consulta_recibida')  AS cases_open,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resuelto')           AS cases_resolved,
  -- Token / cost metrics
  COALESCE(SUM(t.input_tokens),  0)              AS total_input_tokens,
  COALESCE(SUM(t.output_tokens), 0)              AS total_output_tokens,
  COALESCE(SUM(t.total_tokens),  0)              AS total_tokens,
  COALESCE(SUM(t.estimated_cost_usd), 0)         AS total_cost_usd,
  -- Device breakdown (most common)
  MODE() WITHIN GROUP (ORDER BY s.device_type)  AS primary_device,
  MODE() WITHIN GROUP (ORDER BY s.country)      AS primary_country
FROM user_sessions s
FULL OUTER JOIN token_usage t      ON s.user_id = t.user_id
LEFT JOIN cases c                  ON c.user_id = COALESCE(s.user_id, t.user_id)
GROUP BY COALESCE(s.user_id, t.user_id), s.email
ORDER BY last_seen DESC NULLS LAST;


-- ── 4. daily_usage view ───────────────────────────────────────────────────────
-- Day-by-day traffic + cost summary for charts.

CREATE OR REPLACE VIEW daily_usage AS
SELECT
  DATE(session_start)                            AS day,
  COUNT(*)                                       AS sessions,
  COUNT(DISTINCT user_id)                        AS unique_users,
  COUNT(DISTINCT CASE WHEN user_id IS NULL THEN id END) AS anon_sessions,
  ROUND(AVG(duration_seconds)::NUMERIC, 0)       AS avg_duration_s
FROM user_sessions
GROUP BY DATE(session_start)
ORDER BY day DESC;
