-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: empresa_billing
-- Adds hybrid subscription billing (flat base + per-case overage) for empresas.
-- Plans: starter ($0, 5 cases/mo), smb ($99, 50 cases), mid ($299, 200 cases),
--        enterprise ($699+, unlimited)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── empresa_subscriptions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS empresa_subscriptions (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id               UUID        NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  stripe_base_item_id      TEXT,        -- subscription item for flat base price
  stripe_overage_item_id   TEXT,        -- subscription item for metered overage
  plan                     TEXT        NOT NULL DEFAULT 'starter'
                           CHECK (plan IN ('starter', 'smb', 'mid', 'enterprise')),
  status                   TEXT        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'suspended')),
  included_cases           INT         NOT NULL DEFAULT 5,  -- NULL would mean unlimited (enterprise)
  overage_price_cents      INT         NOT NULL DEFAULT 0,  -- cents per extra case
  base_price_cents         INT         NOT NULL DEFAULT 0,
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN     NOT NULL DEFAULT false,
  trial_end                TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id)
);

CREATE INDEX IF NOT EXISTS idx_empresa_subscriptions_company
  ON empresa_subscriptions (company_id);

CREATE INDEX IF NOT EXISTS idx_empresa_subscriptions_stripe_sub
  ON empresa_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE empresa_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_anon_empresa_subscriptions"
  ON empresa_subscriptions FOR ALL TO anon USING (false);

-- Insert starter subscription for every existing company (idempotent via ON CONFLICT)
INSERT INTO empresa_subscriptions (company_id, plan, included_cases, overage_price_cents, base_price_cents)
SELECT id, 'starter', 5, 0, 0
FROM company_accounts
ON CONFLICT (company_id) DO NOTHING;

-- ── empresa_usage ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS empresa_usage (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id             UUID        NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  period_start           DATE        NOT NULL,
  period_end             DATE        NOT NULL,
  cases_received         INT         NOT NULL DEFAULT 0,
  cases_included         INT         NOT NULL DEFAULT 5,
  overage_billed_cents   INT         NOT NULL DEFAULT 0,
  stripe_usage_record_id TEXT,
  reported_to_stripe_at  TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_empresa_usage_company_period
  ON empresa_usage (company_id, period_start DESC);

ALTER TABLE empresa_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_anon_empresa_usage"
  ON empresa_usage FOR ALL TO anon USING (false);

-- ── Helper: ensure current period row exists for a company ────────────────────
-- Called by application layer when a new case is linked to a company.

CREATE OR REPLACE FUNCTION upsert_empresa_usage_period(
  p_company_id UUID,
  p_included_cases INT
) RETURNS VOID AS $$
DECLARE
  v_start DATE := DATE_TRUNC('month', NOW())::DATE;
  v_end   DATE := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::DATE;
BEGIN
  INSERT INTO empresa_usage (company_id, period_start, period_end, cases_received, cases_included)
  VALUES (p_company_id, v_start, v_end, 1, p_included_cases)
  ON CONFLICT (company_id, period_start)
  DO UPDATE SET
    cases_received = empresa_usage.cases_received + 1,
    updated_at     = NOW();
END;
$$ LANGUAGE plpgsql;

-- ── Plan limits view (convenience) ───────────────────────────────────────────

CREATE OR REPLACE VIEW empresa_plan_status AS
SELECT
  ca.id                                         AS company_id,
  ca.nombre,
  COALESCE(es.plan, 'starter')                  AS plan,
  COALESCE(es.status, 'active')                 AS subscription_status,
  COALESCE(es.included_cases, 5)                AS included_cases,
  COALESCE(es.overage_price_cents, 0)           AS overage_price_cents,
  COALESCE(es.base_price_cents, 0)              AS base_price_cents,
  COALESCE(eu.cases_received, 0)                AS cases_this_month,
  GREATEST(
    COALESCE(eu.cases_received, 0) - COALESCE(es.included_cases, 5),
    0
  )                                             AS overage_cases,
  COALESCE(es.current_period_end, NULL)         AS period_end
FROM company_accounts ca
LEFT JOIN empresa_subscriptions es ON es.company_id = ca.id
LEFT JOIN empresa_usage eu ON eu.company_id = ca.id
  AND eu.period_start = DATE_TRUNC('month', NOW())::DATE;
