-- Migration: empresa manual verification request flow (2026-04-30)
-- For empresas whose corporate email does not match the company name
-- heuristic, allow them to submit a manual verification request that an
-- admin reviews and approves/rejects.

CREATE TABLE IF NOT EXISTS verification_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  requester_clerk_id TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  justification   TEXT NOT NULL,
  document_url    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_company
  ON verification_requests (company_id);

CREATE INDEX IF NOT EXISTS idx_verification_requests_pending
  ON verification_requests (created_at DESC)
  WHERE status = 'pending';

-- Only one open pending request per company at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_verification_requests_one_pending_per_company
  ON verification_requests (company_id)
  WHERE status = 'pending';

-- updated_at maintenance trigger
-- search_path is pinned to '' to satisfy Supabase advisor lint
-- 0011_function_search_path_mutable.
CREATE OR REPLACE FUNCTION verification_requests_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verification_requests_updated_at ON verification_requests;
CREATE TRIGGER trg_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION verification_requests_set_updated_at();

-- RLS: deny-all by default; server uses service_role and authorizes per
-- request via Clerk. (Same pattern as the rest of the schema.)
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
