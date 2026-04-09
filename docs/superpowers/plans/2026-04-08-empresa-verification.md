# Empresa Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent company impersonation by requiring corporate email verification before companies can respond to consumer complaints.

**Architecture:** Add `verificada`, `verificada_por`, `verificada_at` fields to `company_accounts` and `email_verificado` to `company_users`. The existing `extractCompanyFromEmail` + `normalizeEmpresaName` functions determine email-company match. Unverified companies get read-only dashboard access; the respond endpoint blocks them with 403.

**Tech Stack:** Supabase (ALTER TABLE migration), Next.js API routes, Clerk (email retrieval), Vitest, Zod, React/Tailwind

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/lib/empresa.ts` | Add `emailMatchesCompany()`, update `registerCompany()` and `linkUserToCompany()` with verification logic |
| Modify | `src/lib/supabase.ts` | Update `CompanyAccount` type with new fields |
| Modify | `src/app/api/empresa/route.ts` | Add email match validation in PUT, pass email to POST registration |
| Modify | `src/app/api/empresa/respond/route.ts` | Add verification guard |
| Modify | `src/app/empresa/page.tsx` | Add verification banner, read-only mode |
| Modify | `src/__tests__/empresa.test.ts` | Tests for `emailMatchesCompany()` |
| Create | `src/__tests__/api/empresa-respond.test.ts` | Tests for verification guard |

---

### Task 1: Add verification fields to types

**Files:**
- Modify: `src/lib/supabase.ts:36-47` (CompanyAccount interface)
- Modify: `src/lib/empresa.ts:28-35` (CompanyUser interface)

- [ ] **Step 1: Update CompanyAccount type in supabase.ts**

Add after `updated_at` in the `CompanyAccount` interface in `src/lib/supabase.ts`:

```typescript
// Existing fields remain, add these three:
readonly verificada: boolean;
readonly verificada_por: string | null;
readonly verificada_at: string | null;
```

Note: `CompanyAccount` is defined in `src/lib/empresa.ts:12-27`, not `supabase.ts`. Update it there.

- [ ] **Step 2: Update CompanyUser type in empresa.ts**

Add after `created_at` in the `CompanyUser` interface in `src/lib/empresa.ts:29-35`:

```typescript
readonly email_verificado: boolean;
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: May show errors in places that construct these objects — that's expected, we fix them in Task 2.

- [ ] **Step 4: Commit**

```bash
git add src/lib/empresa.ts
git commit -m "feat: add verification fields to CompanyAccount and CompanyUser types"
```

---

### Task 2: Add emailMatchesCompany helper + tests

**Files:**
- Modify: `src/lib/empresa.ts`
- Modify: `src/__tests__/empresa.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/__tests__/empresa.test.ts` after the existing `extractCompanyFromEmail` describe block:

```typescript
import { normalizeEmpresaName, extractCompanyFromEmail, emailMatchesCompany } from "@/lib/empresa";

describe("emailMatchesCompany", () => {
  it("returns true when email domain matches company name", () => {
    expect(emailMatchesCompany("juan@telmex.com.mx", "Telmex S.A. de C.V.")).toBe(true);
    expect(emailMatchesCompany("ana@mercadolibre.com", "MercadoLibre")).toBe(true);
  });

  it("returns false for generic email providers", () => {
    expect(emailMatchesCompany("user@gmail.com", "Mi Tienda")).toBe(false);
    expect(emailMatchesCompany("user@hotmail.com", "Hotmail Corp")).toBe(false);
  });

  it("returns false when domain does not match company", () => {
    expect(emailMatchesCompany("user@amazon.com", "Telmex")).toBe(false);
  });

  it("returns false for invalid email", () => {
    expect(emailMatchesCompany("not-an-email", "Telmex")).toBe(false);
    expect(emailMatchesCompany("", "Telmex")).toBe(false);
  });

  it("matches partial domain in normalized name", () => {
    expect(emailMatchesCompany("user@bbva.com.ar", "BBVA Argentina")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/empresa.test.ts`
Expected: FAIL — `emailMatchesCompany` is not exported.

- [ ] **Step 3: Implement emailMatchesCompany**

Add to `src/lib/empresa.ts` after the `extractCompanyFromEmail` function (after line 114):

```typescript
/**
 * Check if a user's email domain matches a company name.
 * Used to verify corporate email ownership.
 */
export function emailMatchesCompany(email: string, companyName: string): boolean {
  const domain = extractCompanyFromEmail(email);
  if (!domain) return false;

  const normalized = normalizeEmpresaName(companyName);
  return normalized.includes(domain);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/empresa.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/empresa.ts src/__tests__/empresa.test.ts
git commit -m "feat: add emailMatchesCompany helper with tests"
```

---

### Task 3: Update registerCompany with verification logic

**Files:**
- Modify: `src/lib/empresa.ts:229-270` (registerCompany function)

- [ ] **Step 1: Update registerCompany signature and logic**

Replace the `registerCompany` function in `src/lib/empresa.ts`:

```typescript
/**
 * Register a new company account and link the creating user as admin.
 * Auto-verifies if the user's email domain matches the company name.
 */
export async function registerCompany(
  clerkUserId: string,
  userEmail: string,
  data: {
    nombre: string;
    rfc?: string;
    cuit?: string;
    sector?: string;
    pais: "AR" | "MX";
    email_contacto?: string;
    telefono?: string;
    domicilio?: string;
  }
): Promise<CompanyAccount> {
  const normalized = normalizeEmpresaName(data.nombre);
  const isVerified = emailMatchesCompany(userEmail, data.nombre);

  const { data: account, error } = await supabase
    .from("company_accounts")
    .insert({
      nombre: data.nombre,
      nombre_normalizado: normalized,
      rfc: data.rfc ?? null,
      cuit: data.cuit ?? null,
      sector: data.sector ?? null,
      pais: data.pais,
      email_contacto: data.email_contacto ?? null,
      telefono: data.telefono ?? null,
      domicilio: data.domicilio ?? null,
      verificada: isVerified,
      verificada_por: isVerified ? clerkUserId : null,
      verificada_at: isVerified ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creando empresa: ${error.message}`);

  // Link user as admin
  await supabase.from("company_users").insert({
    clerk_user_id: clerkUserId,
    company_id: account.id,
    rol: "admin",
    email_verificado: isVerified,
  });

  return account as CompanyAccount;
}
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: Error in `src/app/api/empresa/route.ts` because `registerCompany` now requires `userEmail` param. Fix in Task 5.

- [ ] **Step 3: Commit**

```bash
git add src/lib/empresa.ts
git commit -m "feat: add verification logic to registerCompany"
```

---

### Task 4: Update linkUserToCompany with verification logic

**Files:**
- Modify: `src/lib/empresa.ts:180-192` (linkUserToCompany function)

- [ ] **Step 1: Update linkUserToCompany**

Replace the `linkUserToCompany` function in `src/lib/empresa.ts`:

```typescript
/**
 * Link an existing Clerk user to an existing company account.
 * If the user's email matches the company, marks as verified.
 * If the company was unverified, promotes it to verified.
 */
export async function linkUserToCompany(
  clerkUserId: string,
  companyId: string,
  userEmail: string,
  companyName: string,
  rol: CompanyUser["rol"] = "operador"
): Promise<{ emailVerified: boolean }> {
  const isVerified = emailMatchesCompany(userEmail, companyName);

  if (!isVerified) {
    throw new Error(
      "No puedes vincularte a esta empresa. Tu email debe ser corporativo (ej: @empresa.com)."
    );
  }

  const { error } = await supabase.from("company_users").insert({
    clerk_user_id: clerkUserId,
    company_id: companyId,
    rol,
    email_verificado: isVerified,
  });

  if (error) throw new Error(`Error vinculando usuario: ${error.message}`);

  // If company was unverified, promote it
  if (isVerified) {
    await supabase
      .from("company_accounts")
      .update({
        verificada: true,
        verificada_por: clerkUserId,
        verificada_at: new Date().toISOString(),
      })
      .eq("id", companyId)
      .eq("verificada", false); // only update if not already verified
  }

  return { emailVerified: isVerified };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/empresa.ts
git commit -m "feat: add email verification to linkUserToCompany"
```

---

### Task 5: Update API routes for verification

**Files:**
- Modify: `src/app/api/empresa/route.ts`
- Modify: `src/app/api/empresa/respond/route.ts`

- [ ] **Step 1: Update POST /api/empresa (register)**

In `src/app/api/empresa/route.ts`, the POST handler calls `registerCompany(userId, parsed.data)`. Update it to pass the user email. Replace lines 215-218:

```typescript
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const account = await registerCompany(userId, email, parsed.data);
    return NextResponse.json({ registered: true, account });
  } catch (err) {
```

- [ ] **Step 2: Update PUT /api/empresa (link/claim)**

In `src/app/api/empresa/route.ts`, the PUT handler calls `linkUserToCompany(userId, parsed.data.company_id, "operador")`. Update it to pass email and company name. Replace lines 156-162:

```typescript
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    // Get company name for verification
    const { data: companyData } = await supabase
      .from("company_accounts")
      .select("nombre")
      .eq("id", parsed.data.company_id)
      .single();

    if (!companyData) {
      return NextResponse.json(
        { error: "Empresa no encontrada." },
        { status: 404 }
      );
    }

    await linkUserToCompany(
      userId,
      parsed.data.company_id,
      email,
      companyData.nombre,
      "operador"
    );
    return NextResponse.json({ linked: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al vincular.";
    return NextResponse.json({ error: message }, { status: 403 });
  }
```

Note: also add `import { supabase } from "@/lib/supabase";` at the top of the file.

- [ ] **Step 3: Add verification guard to POST /api/empresa/respond**

In `src/app/api/empresa/respond/route.ts`, add after the `company.role === "lectura"` check (after line 52):

```typescript
  if (!company.account.verificada) {
    return NextResponse.json(
      {
        error:
          "Empresa pendiente de verificacion. Un empleado con email corporativo debe vincularse para habilitar respuestas.",
      },
      { status: 403 }
    );
  }
```

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (all call sites updated)

- [ ] **Step 5: Commit**

```bash
git add src/app/api/empresa/route.ts src/app/api/empresa/respond/route.ts
git commit -m "feat: enforce email verification in empresa API routes"
```

---

### Task 6: Test verification guard on respond endpoint

**Files:**
- Create: `src/__tests__/api/empresa-respond.test.ts`

- [ ] **Step 1: Write test for verification guard**

Create `src/__tests__/api/empresa-respond.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockAuth = vi.fn();
const mockRateLimit = vi.fn().mockResolvedValue({ allowed: true, resetIn: 0 });
const mockGetClientIp = vi.fn().mockReturnValue("127.0.0.1");
const mockGetCompanyForUser = vi.fn();
const mockSubmitResponse = vi.fn();
const mockNotifyConsumerResponse = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}));

vi.mock("@/lib/empresa", () => ({
  getCompanyForUser: (...args: unknown[]) => mockGetCompanyForUser(...args),
  submitResponse: (...args: unknown[]) => mockSubmitResponse(...args),
}));

vi.mock("@/lib/notifications", () => ({
  notifyConsumerResponse: (...args: unknown[]) => mockNotifyConsumerResponse(...args),
}));

import { POST } from "@/app/api/empresa/respond/route";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/empresa/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  case_id: "550e8400-e29b-41d4-a716-446655440000",
  tipo_respuesta: "aceptar",
  mensaje: "Aceptamos su reclamo y procederemos con la devolucion.",
};

describe("POST /api/empresa/respond - verification guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when company is not verified", async () => {
    mockAuth.mockResolvedValue({ userId: "user_abc" });
    mockGetCompanyForUser.mockResolvedValue({
      account: { id: "comp_1", nombre: "Mi Tienda", verificada: false },
      role: "admin",
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("pendiente de verificacion");
  });

  it("allows response when company is verified", async () => {
    mockAuth.mockResolvedValue({ userId: "user_abc" });
    mockGetCompanyForUser.mockResolvedValue({
      account: { id: "comp_1", nombre: "Telmex", verificada: true },
      role: "admin",
    });
    mockSubmitResponse.mockResolvedValue({
      id: "resp_1",
      tipo_respuesta: "aceptar",
      mensaje: "Aceptamos su reclamo y procederemos con la devolucion.",
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/api/empresa-respond.test.ts`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing + new)

- [ ] **Step 4: Commit**

```bash
git add src/__tests__/api/empresa-respond.test.ts
git commit -m "test: add verification guard tests for empresa respond endpoint"
```

---

### Task 7: Update frontend — verification banner and read-only mode

**Files:**
- Modify: `src/app/empresa/page.tsx`

- [ ] **Step 1: Add VerificationBanner component**

Add this component inside `src/app/empresa/page.tsx`, before the `RegistrationForm` component (before line 85):

```typescript
function VerificationBanner({ companyName }: { readonly companyName: string }) {
  const domain = normalizeForDisplay(companyName);
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-amber-800">
            Empresa pendiente de verificacion
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Para habilitar respuestas a reclamos, un empleado con email
            corporativo (ej: @{domain}.com) debe vincularse desde este portal.
          </p>
          <p className="mt-2 text-xs text-amber-600">
            Mientras tanto, puedes ver tus reclamos y estadisticas en modo lectura.
          </p>
        </div>
      </div>
    </div>
  );
}

function normalizeForDisplay(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "").replace(/[.,\-()]/g, "").slice(0, 20);
}
```

- [ ] **Step 2: Add verificada to EmpresaData type**

The `EmpresaData` interface already has `account?: CompanyAccount` which will now include `verificada`. No type change needed — it inherits from the updated `CompanyAccount`.

- [ ] **Step 3: Render VerificationBanner in dashboard view**

In the dashboard rendering section of `src/app/empresa/page.tsx`, find where the dashboard renders for `registered: true`. Add the banner conditionally:

```typescript
{data.account && !data.account.verificada && (
  <VerificationBanner companyName={data.account.nombre} />
)}
```

- [ ] **Step 4: Disable respond buttons when unverified**

In the complaint response section, update the respond button to be disabled when `!data.account?.verificada`:

```typescript
<button
  disabled={!data.account?.verificada || loading}
  title={!data.account?.verificada ? "Requiere verificacion" : undefined}
  className={`... ${!data.account?.verificada ? "cursor-not-allowed opacity-50" : ""}`}
>
```

- [ ] **Step 5: Test manually in browser**

1. Start dev server: `npm run dev`
2. Go to `/empresa` logged in with a generic email — should see banner + disabled buttons
3. Verify the dashboard still shows stats and complaints (read-only)

- [ ] **Step 6: Commit**

```bash
git add src/app/empresa/page.tsx
git commit -m "feat: add verification banner and read-only mode for unverified companies"
```

---

### Task 8: Database migration

**Files:**
- Run SQL against Supabase

- [ ] **Step 1: Run ALTER TABLE migration on Supabase**

Execute via Supabase MCP or dashboard:

```sql
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
```

- [ ] **Step 2: Verify columns exist**

Run: `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'company_accounts' AND column_name IN ('verificada', 'verificada_por', 'verificada_at');`

Expected: 3 rows returned with correct types.

- [ ] **Step 3: Commit a migration record**

```bash
echo "-- Migration: empresa verification fields (2026-04-08)
ALTER TABLE company_accounts ADD COLUMN IF NOT EXISTS verificada boolean NOT NULL DEFAULT false;
ALTER TABLE company_accounts ADD COLUMN IF NOT EXISTS verificada_por text;
ALTER TABLE company_accounts ADD COLUMN IF NOT EXISTS verificada_at timestamptz;
ALTER TABLE company_users ADD COLUMN IF NOT EXISTS email_verificado boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_company_accounts_verificada ON company_accounts (verificada) WHERE verificada = false;" > supabase/migrations/20260408_empresa_verification.sql
git add supabase/migrations/20260408_empresa_verification.sql
git commit -m "chore: add database migration for empresa verification fields"
```

---

### Task 9: Retroactive migration for existing data

**Files:**
- Create: `scripts/verify-existing-companies.ts`

This script checks existing `company_users`, fetches their Clerk email, and updates `email_verificado` and `verificada` for companies where a user has a matching corporate email.

- [ ] **Step 1: Create migration script**

Create `scripts/verify-existing-companies.ts`:

```typescript
/**
 * Retroactive verification of existing company users.
 * Run once after deploying the verification feature.
 *
 * Usage: npx tsx scripts/verify-existing-companies.ts
 */
import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const GENERIC_EMAIL_PROVIDERS = new Set([
  "gmail", "googlemail", "outlook", "hotmail", "live", "msn",
  "yahoo", "ymail", "aol", "icloud", "me", "mac", "protonmail",
  "proton", "zoho", "tutanota", "fastmail", "mail",
]);

function extractDomain(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  const candidate = domain.split(".")[0];
  if (!candidate || GENERIC_EMAIL_PROVIDERS.has(candidate)) return null;
  return candidate;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,\-()]/g, "")
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?|s\.? de c\.?v\.?)\b/gi, "")
    .replace(/\b(argentina|méxico|mexico|de|del|la|el|los|las)\b/gi, "")
    .trim();
}

async function main() {
  // Get all company_users with their company info
  const { data: links } = await supabase
    .from("company_users")
    .select("id, clerk_user_id, company_id");

  if (!links || links.length === 0) {
    console.log("No company_users found. Nothing to migrate.");
    return;
  }

  const { data: companies } = await supabase
    .from("company_accounts")
    .select("id, nombre");

  const companyMap = new Map(
    (companies ?? []).map((c: { id: string; nombre: string }) => [c.id, c.nombre])
  );

  let verified = 0;
  let skipped = 0;

  for (const link of links) {
    const companyName = companyMap.get(link.company_id);
    if (!companyName) { skipped++; continue; }

    const user = await clerk.users.getUser(link.clerk_user_id);
    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const domain = extractDomain(email);

    if (!domain) { skipped++; continue; }

    const normalized = normalize(companyName);
    if (!normalized.includes(domain)) { skipped++; continue; }

    // Update user as email_verificado
    await supabase
      .from("company_users")
      .update({ email_verificado: true })
      .eq("id", link.id);

    // Update company as verificada
    await supabase
      .from("company_accounts")
      .update({
        verificada: true,
        verificada_por: link.clerk_user_id,
        verificada_at: new Date().toISOString(),
      })
      .eq("id", link.company_id)
      .eq("verificada", false);

    verified++;
    console.log(`Verified: ${companyName} (user: ${email})`);
  }

  console.log(`\nDone. Verified: ${verified}, Skipped: ${skipped}`);
}

main().catch(console.error);
```

- [ ] **Step 2: Run the script**

Run: `npx tsx scripts/verify-existing-companies.ts`
Expected: Outputs which companies were verified retroactively.

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-existing-companies.ts
git commit -m "chore: add retroactive verification script for existing companies"
```

---

### Task 10: Run full test suite + type check

**Files:** None (validation only)

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS, no type errors

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing 181 + new verification tests)

- [ ] **Step 3: Run linter**

Run: `npx next lint`
Expected: No errors

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve any type/lint issues from verification feature"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin main
```
