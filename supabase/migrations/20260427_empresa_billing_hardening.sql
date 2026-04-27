-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: empresa_billing_hardening
-- Fixes from QA review of 20260427_empresa_billing.sql:
--   • Add authenticated-role RLS policies (prior migration only blocked anon)
--   • Trigram index on company_accounts.nombre_normalizado for ilike matching
--   • Drop p_included_cases parameter — function looks it up from subscription
--   • Drop redundant index on empresa_subscriptions(company_id)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Trigram index for empresa-matcher ilike pattern ──────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_company_accounts_nombre_norm_trgm
  ON company_accounts USING GIN (nombre_normalizado gin_trgm_ops);

-- ── Drop redundant index ─────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_empresa_subscriptions_company;

-- ── RLS: authenticated users may only read their own company's billing ───────
DROP POLICY IF EXISTS "owner_read_empresa_subscriptions" ON empresa_subscriptions;
CREATE POLICY "owner_read_empresa_subscriptions"
  ON empresa_subscriptions FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

DROP POLICY IF EXISTS "owner_read_empresa_usage" ON empresa_usage;
CREATE POLICY "owner_read_empresa_usage"
  ON empresa_usage FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
    )
  );

-- All writes happen through service role (which bypasses RLS); no INSERT/UPDATE
-- policy is granted to authenticated users.

-- ── Replace upsert function: look up included_cases internally ──────────────
DROP FUNCTION IF EXISTS upsert_empresa_usage_period(UUID, INT);

CREATE OR REPLACE FUNCTION upsert_empresa_usage_period(
  p_company_id UUID
) RETURNS VOID AS $$
DECLARE
  v_start    DATE := DATE_TRUNC('month', NOW())::DATE;
  v_end      DATE := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::DATE;
  v_included INT;
BEGIN
  SELECT included_cases INTO v_included
  FROM empresa_subscriptions
  WHERE company_id = p_company_id;

  v_included := COALESCE(v_included, 5);

  INSERT INTO empresa_usage (company_id, period_start, period_end, cases_received, cases_included)
  VALUES (p_company_id, v_start, v_end, 1, v_included)
  ON CONFLICT (company_id, period_start)
  DO UPDATE SET
    cases_received = empresa_usage.cases_received + 1,
    cases_included = EXCLUDED.cases_included,
    updated_at     = NOW();
END;
$$ LANGUAGE plpgsql;

-- ── SECURITY DEFINER upsert for empresa subscriptions (used by webhook) ─────
CREATE OR REPLACE FUNCTION upsert_empresa_subscription(
  p_company_id             UUID,
  p_stripe_customer_id     TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_base_item_id    TEXT,
  p_stripe_overage_item_id TEXT,
  p_plan                   TEXT,
  p_status                 TEXT,
  p_included_cases         INT,
  p_overage_price_cents    INT,
  p_base_price_cents       INT,
  p_current_period_start   TIMESTAMPTZ,
  p_current_period_end     TIMESTAMPTZ,
  p_cancel_at_period_end   BOOLEAN
) RETURNS VOID AS $$
BEGIN
  INSERT INTO empresa_subscriptions (
    company_id, stripe_customer_id, stripe_subscription_id,
    stripe_base_item_id, stripe_overage_item_id,
    plan, status, included_cases, overage_price_cents, base_price_cents,
    current_period_start, current_period_end, cancel_at_period_end
  ) VALUES (
    p_company_id, p_stripe_customer_id, p_stripe_subscription_id,
    p_stripe_base_item_id, p_stripe_overage_item_id,
    COALESCE(p_plan, 'starter'),
    COALESCE(p_status, 'active'),
    COALESCE(p_included_cases, 5),
    COALESCE(p_overage_price_cents, 0),
    COALESCE(p_base_price_cents, 0),
    p_current_period_start, p_current_period_end,
    COALESCE(p_cancel_at_period_end, false)
  )
  ON CONFLICT (company_id) DO UPDATE SET
    stripe_customer_id     = COALESCE(EXCLUDED.stripe_customer_id, empresa_subscriptions.stripe_customer_id),
    stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, empresa_subscriptions.stripe_subscription_id),
    stripe_base_item_id    = COALESCE(EXCLUDED.stripe_base_item_id, empresa_subscriptions.stripe_base_item_id),
    stripe_overage_item_id = COALESCE(EXCLUDED.stripe_overage_item_id, empresa_subscriptions.stripe_overage_item_id),
    plan                   = COALESCE(EXCLUDED.plan, empresa_subscriptions.plan),
    status                 = COALESCE(EXCLUDED.status, empresa_subscriptions.status),
    included_cases         = COALESCE(EXCLUDED.included_cases, empresa_subscriptions.included_cases),
    overage_price_cents    = COALESCE(EXCLUDED.overage_price_cents, empresa_subscriptions.overage_price_cents),
    base_price_cents       = COALESCE(EXCLUDED.base_price_cents, empresa_subscriptions.base_price_cents),
    current_period_start   = EXCLUDED.current_period_start,
    current_period_end     = EXCLUDED.current_period_end,
    cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
    updated_at             = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_company_id_by_stripe_customer(
  p_customer_id TEXT
) RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT company_id INTO v_company_id
  FROM empresa_subscriptions
  WHERE stripe_customer_id = p_customer_id
  LIMIT 1;
  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
