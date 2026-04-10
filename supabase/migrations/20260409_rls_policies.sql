-- RLS: Enable row level security on all tables + public-read policies
-- Executed: 2026-04-09

-- Habilitar RLS en tablas que no lo tienen
ALTER TABLE company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_stats ENABLE ROW LEVEL SECURITY;

-- Policies de lectura publica (anon key puede leer, no escribir)
CREATE POLICY "anon_select_company_accounts" ON company_accounts
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_complaint_stats" ON complaint_stats
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_sector_stats" ON sector_stats
  FOR SELECT TO anon USING (true);

-- Tablas con datos sensibles quedan bloqueadas para anon (deny-all por defecto):
-- cases, feedback, company_users, company_responses
