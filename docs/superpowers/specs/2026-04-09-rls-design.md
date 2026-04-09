# Row Level Security (RLS) — Defense in Depth

> Spec para habilitar RLS en todas las tablas de Supabase como capa de seguridad adicional.
> Fecha: 2026-04-09

---

## Problema

5 de 7 tablas no tienen RLS habilitado. Las 2 que lo tienen (`cases`, `feedback`) no tienen policies definidas. Si alguien obtiene el anon key, podria leer/escribir datos sensibles directamente en las tablas sin RLS.

## Solucion

Habilitar RLS en todas las tablas + crear policies restrictivas. El server sigue usando service_role (bypasa RLS). Las policies son defensa en profundidad — protegen si alguien usa el anon key directamente.

**Impacto en la app**: Cero. Ninguna query usa el anon key actualmente. No se modifica ningun archivo `.ts`/`.tsx`.

---

## 1. Estado actual

| Tabla | RLS | Policies | Datos sensibles |
|-------|-----|----------|-----------------|
| `cases` | ON | Ninguna | Si (relato, user_id, analisis) |
| `feedback` | ON | Ninguna | Si (user_id, comentarios) |
| `company_accounts` | OFF | — | No (nombre, sector, pais) |
| `company_users` | OFF | — | Si (clerk_user_id, company_id) |
| `company_responses` | OFF | — | Si (mensajes, montos) |
| `complaint_stats` | OFF | — | No (datos agregados) |
| `sector_stats` | OFF | — | No (datos agregados) |

---

## 2. Policies a crear

### Deny-all (RLS ON, sin policies para anon)

Tablas con datos sensibles — el anon key no puede leer ni escribir:

- `cases` — ya tiene RLS ON, sin policies = bloqueado
- `feedback` — ya tiene RLS ON, sin policies = bloqueado
- `company_users` — habilitar RLS, sin policies = bloqueado
- `company_responses` — habilitar RLS, sin policies = bloqueado

### SELECT publico (anon puede leer, no escribir)

Tablas con datos no sensibles:

- `company_accounts` — nombre, sector, pais son publicos. SELECT permitido, INSERT/UPDATE/DELETE bloqueado.
- `complaint_stats` — estadisticas agregadas. SELECT permitido.
- `sector_stats` — estadisticas agregadas. SELECT permitido.

---

## 3. SQL a ejecutar

```sql
-- Habilitar RLS en tablas que no lo tienen
ALTER TABLE company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_stats ENABLE ROW LEVEL SECURITY;

-- Policies de lectura publica
CREATE POLICY "anon_select_company_accounts" ON company_accounts
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_complaint_stats" ON complaint_stats
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_sector_stats" ON sector_stats
  FOR SELECT TO anon USING (true);
```

---

## 4. Validacion post-migracion

Verificar con el anon key (via Supabase dashboard o query directa):

| Query | Resultado esperado |
|-------|--------------------|
| `SELECT * FROM cases` como anon | 0 rows |
| `SELECT * FROM feedback` como anon | 0 rows |
| `SELECT * FROM company_users` como anon | 0 rows |
| `SELECT * FROM company_responses` como anon | 0 rows |
| `SELECT * FROM company_accounts` como anon | Rows visibles |
| `SELECT * FROM complaint_stats` como anon | Rows visibles |
| `SELECT * FROM sector_stats` como anon | Rows visibles |
| `INSERT INTO cases (...)` como anon | Error (bloqueado) |
| App funciona normal con service_role | Todo OK, sin cambios |

---

## 5. Archivos impactados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260409_rls_policies.sql` | Archivo de migracion con el SQL |
| Supabase DB | Ejecucion directa del SQL |

Ningun archivo `.ts`/`.tsx` se modifica.
