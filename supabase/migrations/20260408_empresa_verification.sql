-- Migration: empresa verification fields (2026-04-08)
-- Adds corporate email verification for company identity validation.

-- Add verification fields to company_accounts
ALTER TABLE company_accounts
  ADD COLUMN IF NOT EXISTS verificada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verificada_por text,
  ADD COLUMN IF NOT EXISTS verificada_at timestamptz;

-- Add email_verificado to company_users
ALTER TABLE company_users
  ADD COLUMN IF NOT EXISTS email_verificado boolean NOT NULL DEFAULT false;

-- Index for quick lookup of unverified companies
CREATE INDEX IF NOT EXISTS idx_company_accounts_verificada
  ON company_accounts (verificada) WHERE verificada = false;
