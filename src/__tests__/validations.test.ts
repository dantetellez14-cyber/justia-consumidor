import { describe, it, expect } from "vitest";
import {
  analyzeSchema,
  createCaseSchema,
  feedbackSchema,
  sendComplaintSchema,
  searchJurisprudenciaSchema,
  formatZodError,
} from "@/lib/validations";

// ── analyzeSchema ──

describe("analyzeSchema", () => {
  it("accepts a valid relato", () => {
    const result = analyzeSchema.safeParse({
      relato: "Compré un televisor en MercadoLibre y nunca llegó",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty relato", () => {
    const result = analyzeSchema.safeParse({ relato: "" });
    expect(result.success).toBe(false);
  });

  it("rejects relato shorter than 10 chars", () => {
    const result = analyzeSchema.safeParse({ relato: "hola" });
    expect(result.success).toBe(false);
  });

  it("rejects relato longer than 5000 chars", () => {
    const result = analyzeSchema.safeParse({ relato: "x".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("accepts relato exactly at 5000 chars", () => {
    const result = analyzeSchema.safeParse({ relato: "x".repeat(5000) });
    expect(result.success).toBe(true);
  });

  it("rejects missing relato field", () => {
    const result = analyzeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string relato", () => {
    const result = analyzeSchema.safeParse({ relato: 12345 });
    expect(result.success).toBe(false);
  });
});

// ── createCaseSchema ──

describe("createCaseSchema", () => {
  const validCase = {
    relato: "Mi reclamo completo",
    empresa: "Telecom",
    producto_servicio: "Internet",
    monto_reclamo: 50000,
    fecha_incidente: "2024-01-15",
    core_grievance: "Cobro indebido",
    probabilidad_exito: 0.75,
    analisis_legal: "Art. 10 bis Ley 24.240",
    pais_detectado: "AR" as const,
  };

  it("accepts a valid case", () => {
    const result = createCaseSchema.safeParse(validCase);
    expect(result.success).toBe(true);
  });

  it("rejects negative monto_reclamo", () => {
    const result = createCaseSchema.safeParse({
      ...validCase,
      monto_reclamo: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects probabilidad_exito > 1", () => {
    const result = createCaseSchema.safeParse({
      ...validCase,
      probabilidad_exito: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects probabilidad_exito < 0", () => {
    const result = createCaseSchema.safeParse({
      ...validCase,
      probabilidad_exito: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pais_detectado", () => {
    const result = createCaseSchema.safeParse({
      ...validCase,
      pais_detectado: "US",
    });
    expect(result.success).toBe(false);
  });

  it("accepts MX as pais_detectado", () => {
    const result = createCaseSchema.safeParse({
      ...validCase,
      pais_detectado: "MX",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = createCaseSchema.safeParse({ relato: "algo" });
    expect(result.success).toBe(false);
  });
});

// ── feedbackSchema ──

describe("feedbackSchema", () => {
  it("accepts valid feedback with rating only", () => {
    const result = feedbackSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(true);
  });

  it("accepts feedback with all fields", () => {
    const result = feedbackSchema.safeParse({
      case_id: "550e8400-e29b-41d4-a716-446655440000",
      rating: 5,
      comment: "Excelente servicio",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = feedbackSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = feedbackSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = feedbackSchema.safeParse({ rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects comment over 2000 chars", () => {
    const result = feedbackSchema.safeParse({
      rating: 3,
      comment: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts null case_id", () => {
    const result = feedbackSchema.safeParse({ rating: 3, case_id: null });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for case_id", () => {
    const result = feedbackSchema.safeParse({
      rating: 3,
      case_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

// ── sendComplaintSchema ──

describe("sendComplaintSchema", () => {
  const validComplaint = {
    analysis: {
      empresa: "Telecom",
      producto_servicio: "Internet",
      monto_reclamo: 50000,
      fecha_incidente: "2024-01-15",
      core_grievance: "Cobro indebido",
      probabilidad_exito: 0.75,
      analisis_legal: "Art. 10 bis Ley 24.240",
      pais_detectado: "AR" as const,
    },
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    empresaEmail: "reclamos@telecom.com",
    complaintText: "Por medio de la presente solicito el reembolso...",
    caseId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts valid complaint", () => {
    const result = sendComplaintSchema.safeParse(validComplaint);
    expect(result.success).toBe(true);
  });

  it("accepts null caseId", () => {
    const result = sendComplaintSchema.safeParse({
      ...validComplaint,
      caseId: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid user email", () => {
    const result = sendComplaintSchema.safeParse({
      ...validComplaint,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid empresa email", () => {
    const result = sendComplaintSchema.safeParse({
      ...validComplaint,
      empresaEmail: "bad-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty nombre", () => {
    const result = sendComplaintSchema.safeParse({
      ...validComplaint,
      nombre: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short complaint text", () => {
    const result = sendComplaintSchema.safeParse({
      ...validComplaint,
      complaintText: "corto",
    });
    expect(result.success).toBe(false);
  });
});

// ── searchJurisprudenciaSchema ──

describe("searchJurisprudenciaSchema", () => {
  it("accepts query without pais", () => {
    const result = searchJurisprudenciaSchema.safeParse({
      query: "garantía electrodoméstico",
    });
    expect(result.success).toBe(true);
  });

  it("accepts query with AR pais", () => {
    const result = searchJurisprudenciaSchema.safeParse({
      query: "garantía electrodoméstico",
      pais: "AR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty query", () => {
    const result = searchJurisprudenciaSchema.safeParse({ query: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pais", () => {
    const result = searchJurisprudenciaSchema.safeParse({
      query: "test",
      pais: "US",
    });
    expect(result.success).toBe(false);
  });

  it("rejects query over 2000 chars", () => {
    const result = searchJurisprudenciaSchema.safeParse({
      query: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ── formatZodError ──

describe("formatZodError", () => {
  it("formats single error", () => {
    const result = analyzeSchema.safeParse({ relato: "" });
    if (!result.success) {
      const msg = formatZodError(result.error);
      expect(msg).toContain("10");
    }
  });

  it("formats multiple errors with comma separator", () => {
    const result = createCaseSchema.safeParse({});
    if (!result.success) {
      const msg = formatZodError(result.error);
      expect(msg.split(",").length).toBeGreaterThan(1);
    }
  });
});
