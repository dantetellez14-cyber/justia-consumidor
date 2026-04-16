-- jurisprudencia_cases: structured consumer-law case data scraped from AR/MX portals
-- and normalized by AI (Gemini → Ollama fallback).
-- Executed: 2026-04-16

CREATE TABLE IF NOT EXISTS jurisprudencia_cases (
  expediente_id        TEXT        PRIMARY KEY,
  hechos               TEXT        NOT NULL DEFAULT '',
  ratio_decidendi      TEXT        NOT NULL DEFAULT '',
  probabilidad_exito   FLOAT       NOT NULL DEFAULT 0,
  duracion_dias        INT         NOT NULL DEFAULT 0,
  pais                 TEXT        NOT NULL CHECK (pais IN ('AR', 'MX')),
  categoria            TEXT        NOT NULL DEFAULT '',
  tribunal             TEXT        NOT NULL DEFAULT '',
  fecha_resolucion     TEXT        NOT NULL DEFAULT '',   -- ISO "YYYY-MM-DD"
  url_fuente           TEXT        NOT NULL DEFAULT '',
  texto_crudo          TEXT        NOT NULL DEFAULT '',
  normalizado_por_ia   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_jurisprudencia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jurisprudencia_updated_at
  BEFORE UPDATE ON jurisprudencia_cases
  FOR EACH ROW EXECUTE FUNCTION update_jurisprudencia_updated_at();

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_pais         ON jurisprudencia_cases (pais);
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_normalizado  ON jurisprudencia_cases (normalizado_por_ia);
CREATE INDEX IF NOT EXISTS idx_jurisprudencia_prob         ON jurisprudencia_cases (probabilidad_exito);

-- RLS
ALTER TABLE jurisprudencia_cases ENABLE ROW LEVEL SECURITY;

-- Anon / public: read-only (needed for the fallback API route using the public client,
-- and for any future server-component direct reads)
CREATE POLICY "anon_select_jurisprudencia" ON jurisprudencia_cases
  FOR SELECT TO anon USING (true);

-- Authenticated service role writes are handled by the admin (service-role) client
-- which bypasses RLS entirely — no explicit policy needed for INSERT/UPDATE/DELETE.
