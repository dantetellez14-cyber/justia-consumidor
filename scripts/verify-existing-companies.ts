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

    await supabase
      .from("company_users")
      .update({ email_verificado: true })
      .eq("id", link.id);

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
