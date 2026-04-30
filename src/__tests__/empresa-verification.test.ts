import { describe, it, expect, vi, beforeEach } from "vitest";

// Reusable supabase fluent mock — each test sets up the chain it needs
// via vi.mocked(...).mockReturnValue / mockResolvedValue.
//
// We model each call as: supabase.from(table) returns a builder object whose
// methods (select, eq, insert, update, single, etc.) all return either the
// builder again or a thenable / promise that the caller awaits.
//
// To keep tests readable we inject per-test return values via
// `setSupabaseScript([...steps])`.

type Step =
  | { kind: "data"; value: unknown; error?: { code?: string; message?: string } | null }
  | { kind: "error"; error: { code?: string; message?: string } };

let queue: Step[] = [];

function nextStep(): Step | undefined {
  return queue.shift();
}

function makeBuilder(): unknown {
  // Every builder method returns the builder itself (chainable). When the
  // caller awaits, the promise resolves to the next step in `queue`.
  const builder: Record<string, unknown> = {};
  const chainable = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "in",
    "ilike",
    "order",
    "limit",
  ];
  for (const m of chainable) {
    builder[m] = () => builder;
  }
  builder.single = () => Promise.resolve(stepToShape());
  builder.maybeSingle = () => Promise.resolve(stepToShape());
  // Insert/update/select() awaited directly (without .single()) — also
  // resolves to a step.
  (builder as { then?: unknown }).then = (
    onFulfilled: (v: unknown) => unknown
  ) => Promise.resolve(stepToShape()).then(onFulfilled);
  return builder;
}

function stepToShape(): { data: unknown; error: { code?: string; message?: string } | null } {
  const step = nextStep();
  if (!step) return { data: null, error: null };
  if (step.kind === "data") return { data: step.value, error: step.error ?? null };
  return { data: null, error: step.error };
}

function setSupabaseScript(steps: Step[]): void {
  queue = [...steps];
}

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => makeBuilder(),
  },
}));

import {
  createVerificationRequest,
  approveVerificationRequest,
  rejectVerificationRequest,
} from "@/lib/empresa";

beforeEach(() => {
  queue = [];
});

describe("createVerificationRequest", () => {
  it("inserts a pending request when company is unverified", async () => {
    setSupabaseScript([
      // 1. SELECT company → returns unverified
      { kind: "data", value: { id: "comp-1", verificada: false } },
      // 2. INSERT into verification_requests → returns the new row
      {
        kind: "data",
        value: {
          id: "req-1",
          company_id: "comp-1",
          requester_clerk_id: "user_abc",
          requester_email: "x@y.com",
          justification: "I work here, here is the explanation",
          document_url: null,
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          created_at: "2026-04-30T00:00:00Z",
          updated_at: "2026-04-30T00:00:00Z",
        },
      },
    ]);

    const result = await createVerificationRequest({
      clerkUserId: "user_abc",
      email: "x@y.com",
      companyId: "comp-1",
      justification: "I work here, here is the explanation",
    });

    expect(result.id).toBe("req-1");
    expect(result.status).toBe("pending");
  });

  it("rejects when company is already verified", async () => {
    setSupabaseScript([
      { kind: "data", value: { id: "comp-1", verificada: true } },
    ]);

    await expect(
      createVerificationRequest({
        clerkUserId: "user_abc",
        email: "x@y.com",
        companyId: "comp-1",
        justification: "any justification at all here",
      })
    ).rejects.toThrow(/ya esta verificada/i);
  });

  it("translates 23505 (unique violation) to a friendly message", async () => {
    setSupabaseScript([
      { kind: "data", value: { id: "comp-1", verificada: false } },
      { kind: "error", error: { code: "23505", message: "duplicate" } },
    ]);

    await expect(
      createVerificationRequest({
        clerkUserId: "user_abc",
        email: "x@y.com",
        companyId: "comp-1",
        justification: "another justification text long enough",
      })
    ).rejects.toThrow(/solicitud pendiente/i);
  });

  it("rejects when company does not exist", async () => {
    setSupabaseScript([{ kind: "data", value: null }]);

    await expect(
      createVerificationRequest({
        clerkUserId: "user_abc",
        email: "x@y.com",
        companyId: "missing",
        justification: "justification text long enough here",
      })
    ).rejects.toThrow(/no encontrada/i);
  });
});

describe("approveVerificationRequest", () => {
  it("marks company verified, links requester, and updates request", async () => {
    setSupabaseScript([
      // 1. SELECT request → returns pending
      {
        kind: "data",
        value: {
          id: "req-1",
          company_id: "comp-1",
          requester_clerk_id: "user_abc",
          requester_email: "x@y.com",
          justification: "j",
          document_url: null,
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          created_at: "2026-04-30T00:00:00Z",
          updated_at: "2026-04-30T00:00:00Z",
        },
      },
      // 2. UPDATE company_accounts → success
      { kind: "data", value: null },
      // 3. SELECT existing company_users link → none
      { kind: "data", value: null },
      // 4. INSERT new company_users link → success
      { kind: "data", value: null },
      // 5. UPDATE verification_requests → success
      { kind: "data", value: null },
    ]);

    const result = await approveVerificationRequest({
      requestId: "req-1",
      adminClerkId: "admin_xyz",
    });

    expect(result.company_id).toBe("comp-1");
  });

  it("rejects when request is not pending", async () => {
    setSupabaseScript([
      {
        kind: "data",
        value: {
          id: "req-1",
          company_id: "comp-1",
          requester_clerk_id: "user_abc",
          status: "approved",
          // ... other fields
        },
      },
    ]);

    await expect(
      approveVerificationRequest({ requestId: "req-1", adminClerkId: "admin" })
    ).rejects.toThrow(/ya esta en estado/i);
  });

  it("rejects when request not found", async () => {
    setSupabaseScript([{ kind: "data", value: null }]);

    await expect(
      approveVerificationRequest({ requestId: "nope", adminClerkId: "admin" })
    ).rejects.toThrow(/no encontrada/i);
  });
});

describe("rejectVerificationRequest", () => {
  it("updates a pending request to rejected", async () => {
    setSupabaseScript([
      { kind: "data", value: { status: "pending" } },
      { kind: "data", value: null },
    ]);

    await expect(
      rejectVerificationRequest({
        requestId: "req-1",
        adminClerkId: "admin_xyz",
        notes: "no proof",
      })
    ).resolves.toBeUndefined();
  });

  it("rejects when request was already reviewed", async () => {
    setSupabaseScript([{ kind: "data", value: { status: "rejected" } }]);

    await expect(
      rejectVerificationRequest({ requestId: "req-1", adminClerkId: "admin" })
    ).rejects.toThrow(/ya fue revisada/i);
  });

  it("rejects when request not found", async () => {
    setSupabaseScript([{ kind: "data", value: null }]);

    await expect(
      rejectVerificationRequest({ requestId: "nope", adminClerkId: "admin" })
    ).rejects.toThrow(/no encontrada/i);
  });
});
