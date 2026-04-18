import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getCompanyForUser,
  registerCompany,
  getCompanyDashboardStats,
  getCompanyComplaints,
  findCompanyByEmailDomain,
  findCasesByEmailDomain,
  linkUserToCompany,
} from "@/lib/empresa";
import { notifyEmpresaWelcome } from "@/lib/notifications";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

const registerSchema = z.object({
  nombre: z.string().min(2, "Nombre de empresa requerido"),
  rfc: z.string().optional(),
  cuit: z.string().optional(),
  sector: z.string().optional(),
  pais: z.enum(["AR", "MX"]),
  // optional in the body — defaults to the user's own email if omitted
  email_contacto: z.string().email("Email de contacto inválido").optional(),
  telefono: z.string().optional(),
  domicilio: z.string().optional(),
});

/**
 * GET /api/empresa — Get company profile, stats, and complaints
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`empresa-get:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesion." },
      { status: 401 }
    );
  }

  const company = await getCompanyForUser(userId);
  if (!company) {
    // Try auto-detection by email domain
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    // Check if email domain matches a registered company
    const existingMatch = await findCompanyByEmailDomain(email);
    if (existingMatch) {
      return NextResponse.json({
        registered: false,
        suggestion: {
          type: "existing_account" as const,
          account: existingMatch,
          email,
        },
      });
    }

    // Check if email domain matches complaints in cases table
    const casesMatch = await findCasesByEmailDomain(email);
    if (casesMatch) {
      return NextResponse.json({
        registered: false,
        suggestion: {
          type: "has_complaints" as const,
          empresaName: casesMatch.empresaName,
          complaintCount: casesMatch.count,
          email,
        },
      });
    }

    return NextResponse.json({ registered: false });
  }

  const [stats, complaints] = await Promise.all([
    getCompanyDashboardStats(company.account),
    getCompanyComplaints(company.account),
  ]);

  return NextResponse.json({
    registered: true,
    account: company.account,
    role: company.role,
    stats,
    complaints,
  });
}

/**
 * PUT /api/empresa — Claim/link to an existing company account
 */
export async function PUT(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`empresa-put:${ip}`, {
    limit: 5,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesion." },
      { status: 401 }
    );
  }

  const existing = await getCompanyForUser(userId);
  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes una empresa vinculada." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const claimSchema = z.object({
    company_id: z.string().uuid("ID de empresa invalido"),
  });

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

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
}

/**
 * POST /api/empresa — Register a new company account
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`empresa-post:${ip}`, {
    limit: 5,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesion." },
      { status: 401 }
    );
  }

  // Check if user already has a company
  const existing = await getCompanyForUser(userId);
  if (existing) {
    return NextResponse.json(
      { error: "Ya tienes una empresa registrada." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    // Default email_contacto to the registering user's email if not supplied
    const data = {
      ...parsed.data,
      email_contacto: parsed.data.email_contacto ?? email,
    };

    const account = await registerCompany(userId, email, data);

    // Fire-and-forget: welcome email with count of pending complaints
    const contactEmail = data.email_contacto;
    getCompanyComplaints(account)
      .then((complaints) => {
        notifyEmpresaWelcome({
          empresaNombre: account.nombre,
          emailContacto: contactEmail,
          pendingCount: complaints.length,
        });
      })
      .catch(() => {}); // swallow — non-critical

    return NextResponse.json({ registered: true, account });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
