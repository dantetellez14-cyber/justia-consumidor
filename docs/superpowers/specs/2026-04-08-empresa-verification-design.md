# Verificacion de Empresa por Email Corporativo

> Spec para implementar verificacion de identidad empresarial en JustIA Consumidor.
> Fecha: 2026-04-08

---

## Problema

Cualquier usuario puede registrarse como cualquier empresa o vincularse a una existente sin validacion. Esto permite suplantacion de identidad empresarial.

## Solucion

Verificacion automatica por email corporativo. Si el dominio del email del usuario (e.g. `@telmex.com.mx`) coincide con el nombre de la empresa, se verifica automaticamente. Empresas registradas sin email corporativo quedan en estado `pendiente_verificacion` con acceso read-only al dashboard.

---

## 1. Modelo de datos

### company_accounts (campos nuevos)

| Campo | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| `verificada` | `boolean` | `false` | Empresa tiene al menos un usuario con email corporativo verificado |
| `verificada_por` | `text (nullable)` | `null` | `clerk_user_id` del usuario que verifico |
| `verificada_at` | `timestamptz (nullable)` | `null` | Fecha de verificacion |

### company_users (campos nuevos)

| Campo | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| `email_verificado` | `boolean` | `false` | El email Clerk de este usuario coincide con el dominio de la empresa |

### Regla de verificacion

Una empresa pasa a `verificada = true` cuando al menos un `company_user` con `email_verificado = true` se vincula a ella.

---

## 2. Flujos de verificacion

### 2.1 Registro nuevo (POST /api/empresa)

1. Usuario envia datos de empresa (nombre, RFC/CUIT, etc.)
2. Se extrae dominio del email Clerk del usuario via `extractCompanyFromEmail()`
3. Se normaliza el nombre de empresa y se compara con el dominio
4. **Match** (e.g. email `@telmex.com.mx`, empresa "Telmex"):
   - Empresa: `verificada: true`, `verificada_por: userId`, `verificada_at: now()`
   - Usuario: `email_verificado: true`, rol `admin`
5. **No match** (e.g. email `@gmail.com`):
   - Empresa: `verificada: false`
   - Usuario: `email_verificado: false`, rol `admin`

### 2.2 Vinculacion (PUT /api/empresa)

1. Usuario pide vincularse a empresa existente via `company_id`
2. Se extrae dominio de su email Clerk
3. **Match con nombre de empresa**:
   - Se vincula con `email_verificado: true`
   - Si empresa tenia `verificada: false`, se actualiza a `verificada: true`
4. **No match**:
   - Se rechaza la vinculacion (403). No puedes vincularte sin email corporativo

### 2.3 Auto-deteccion (GET /api/empresa)

- Sigue funcionando igual
- La suggestion ahora incluye el campo `verificada` para que el frontend conozca el estado
- Solo sugiere vinculacion si el email del usuario matchea con la empresa

---

## 3. Permisos segun estado

| Estado empresa | email_verificado del usuario | Ve dashboard? | Puede responder? |
|---|---|---|---|
| `verificada: true` | `true` | Si | Si |
| `verificada: true` | `false` | Si | Si (empresa ya verificada por otro) |
| `verificada: false` | `false` | Si (read-only) | **No** |

### Endpoint protegido

`POST /api/empresa/respond` — Nuevo check: si `company_accounts.verificada = false`, retorna `403 "Empresa pendiente de verificacion. Un empleado con email corporativo debe vincularse."`.

---

## 4. Cambios en frontend

### Portal empresa (`/empresa/page.tsx`)

- **Empresa verificada**: Sin cambios visibles.
- **Empresa pendiente (`verificada: false`)**:
  - Banner amarillo fijo arriba: "Empresa pendiente de verificacion"
  - Dashboard se renderiza read-only:
    - Estadisticas y lista de reclamos visibles
    - Botones de responder deshabilitados (grayed out)
    - Tooltip en botones: "Requiere verificacion"
  - Instruccion en banner: "Para verificar tu empresa, un empleado con email corporativo @[dominio] debe vincularse desde este portal."

### Registro nuevo

- Si queda en `pendiente_verificacion`, se muestra el banner read-only
- Si se verifica automaticamente, flujo normal sin cambios

### Flujo consumidor

- Sin cambios. El consumidor no ve el estado de verificacion de la empresa.
- Notificaciones email siguen funcionando igual.

---

## 5. Edge cases

- **Empresa con dominio generico** (registro con `@gmail.com`): Queda en pendiente indefinidamente. Intencional: incentiva email corporativo.
- **Multiples dominios** (e.g. `@telmex.com.mx` y `@telmex.com`): `extractCompanyFromEmail` extrae la parte antes del primer punto, asi que ambos producen "telmex". Cubierto.
- **Match falso positivo** (e.g. `@sol.com` matchea con "Soluciones SA"): Riesgo bajo, aceptable para esta etapa.

---

## 6. Migracion de datos

- Empresas existentes: `verificada = false` por defecto
- Script retroactivo: revisa `company_users` existentes, obtiene email Clerk de cada uno, evalua match con su empresa, y actualiza `email_verificado` y `verificada` segun corresponda

---

## 7. Archivos impactados

| Archivo | Cambio |
|---------|--------|
| `src/lib/empresa.ts` | Tipos actualizados, logica de verificacion en `registerCompany` y `linkUserToCompany` |
| `src/app/api/empresa/route.ts` | Validacion de email corporativo en POST y PUT, check de verificacion |
| `src/app/api/empresa/respond/route.ts` | Guard de verificacion antes de permitir respuesta |
| `src/app/empresa/page.tsx` | Banner de verificacion, modo read-only |
| `src/lib/supabase.ts` | Tipos actualizados para nuevos campos |
| Supabase migrations | ALTER TABLE para nuevos campos |
| Script de migracion | Retroactivo para datos existentes |
