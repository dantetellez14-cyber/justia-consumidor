-- notifications: in-app notification feed per user
-- Created: 2026-04-16

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,          -- Clerk user ID
  case_id     UUID        REFERENCES cases(id) ON DELETE CASCADE,
  tipo        TEXT        NOT NULL CHECK (tipo IN (
                'company_response',
                'status_change',
                'ai_update',
                'escalacion',
                'sistema'
              )),
  titulo      TEXT        NOT NULL DEFAULT '',
  mensaje     TEXT        NOT NULL DEFAULT '',
  leida       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: fast per-user notification feed
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications (user_id, created_at DESC);

-- Index: fast unread count
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (user_id, leida) WHERE leida = FALSE;

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- API routes use the admin (service-role) client which bypasses RLS.
-- No anon/authenticated policies needed for now.
-- Future: add Clerk JWT integration with Supabase to allow row-level policies.
