import { describe, it, expect } from "vitest";
import {
  getChannelsForCountry,
  getChannelById,
  getRecommendedChannel,
  prefillFromAnalysis,
  generateEscalationDocument,
  getFilingInstructions,
} from "@/lib/escalation";
import type { CaseAnalysis } from "@/lib/types";

const mockAnalysisMX: CaseAnalysis = {
  empresa: "Telmex",
  producto_servicio: "Internet fibra óptica",
  monto_reclamo: 5000,
  fecha_incidente: "2026-01-15",
  core_grievance: "Cobro indebido por servicio no prestado durante 2 meses",
  probabilidad_exito: 0.75,
  analisis_legal: "Art. 7 y 92 LFPC",
  pais_detectado: "MX",
};

const mockAnalysisAR: CaseAnalysis = {
  empresa: "Personal",
  producto_servicio: "Telefonía móvil",
  monto_reclamo: 15000,
  fecha_incidente: "2026-02-10",
  core_grievance: "Aumento unilateral del plan sin notificación",
  probabilidad_exito: 0.8,
  analisis_legal: "Art. 4 y 10bis Ley 24.240",
  pais_detectado: "AR",
};

describe("getChannelsForCountry", () => {
  it("returns MX channels for Mexico", () => {
    const channels = getChannelsForCountry("MX");
    expect(channels.length).toBe(2);
    expect(channels.every((ch) => ch.pais === "MX")).toBe(true);
    expect(channels.map((ch) => ch.id)).toContain("profeco_queja");
    expect(channels.map((ch) => ch.id)).toContain("profeco_concilianet");
  });

  it("returns AR channels for Argentina", () => {
    const channels = getChannelsForCountry("AR");
    expect(channels.length).toBe(2);
    expect(channels.every((ch) => ch.pais === "AR")).toBe(true);
    expect(channels.map((ch) => ch.id)).toContain("coprec");
    expect(channels.map((ch) => ch.id)).toContain("defensa_consumidor");
  });
});

describe("getChannelById", () => {
  it("returns the correct channel", () => {
    const ch = getChannelById("coprec");
    expect(ch).toBeDefined();
    expect(ch?.nombre).toContain("COPREC");
    expect(ch?.obligatorio).toBe(true);
  });

  it("returns undefined for invalid id", () => {
    // @ts-expect-error testing invalid input
    expect(getChannelById("invalid")).toBeUndefined();
  });
});

describe("getRecommendedChannel", () => {
  it("recommends COPREC for Argentina", () => {
    expect(getRecommendedChannel("AR", mockAnalysisAR)).toBe("coprec");
  });

  it("recommends Concilianet for Mexico", () => {
    expect(getRecommendedChannel("MX", mockAnalysisMX)).toBe(
      "profeco_concilianet"
    );
  });
});

describe("prefillFromAnalysis", () => {
  it("extracts company and claim data", () => {
    const prefilled = prefillFromAnalysis(mockAnalysisMX, "Juan", "j@e.com");
    expect(prefilled.nombreCompleto).toBe("Juan");
    expect(prefilled.email).toBe("j@e.com");
    expect(prefilled.empresaNombre).toBe("Telmex");
    expect(prefilled.montoReclamado).toBe(5000);
    expect(prefilled.productoServicio).toBe("Internet fibra óptica");
    expect(prefilled.reclamoDirectoRealizado).toBe(true);
  });
});

describe("generateEscalationDocument", () => {
  const baseForm = {
    nombreCompleto: "Juan Pérez",
    documento: "CURP123456",
    domicilio: "Av. Reforma 100, CDMX",
    email: "juan@test.com",
    telefono: "+52 55 1234 5678",
    empresaNombre: "Telmex",
    empresaDomicilio: "Av. Chapultepec 200",
    empresaRFC: "TEL850101XXX",
    descripcionHechos: "Cobro indebido",
    montoReclamado: 5000,
    fechaCompra: "2026-01-15",
    productoServicio: "Internet",
    resolucionSolicitada: "Devolución del monto",
    reclamoDirectoRealizado: true,
    fechaReclamoDirecto: "2026-02-01",
    numeroReclamoDirecto: "REC-123",
  };

  it("generates PROFECO document with all sections", () => {
    const doc = generateEscalationDocument(
      "profeco_queja",
      baseForm,
      mockAnalysisMX
    );
    expect(doc.titulo).toBe("Queja PROFECO");
    expect(doc.contenido).toContain("PROCURADURÍA FEDERAL DEL CONSUMIDOR");
    expect(doc.contenido).toContain("Juan Pérez");
    expect(doc.contenido).toContain("Telmex");
    expect(doc.contenido).toContain("CURP123456");
    expect(doc.contenido).toContain("FUNDAMENTO LEGAL");
    expect(doc.contenido).toContain("DOCUMENTOS ADJUNTOS");
    expect(doc.filename).toContain("profeco");
  });

  it("generates COPREC document with Ley 26.993 reference", () => {
    const arForm = {
      ...baseForm,
      documento: "12345678",
      empresaNombre: "Personal",
      empresaCUIT: "30-12345678-9",
    };
    const doc = generateEscalationDocument(
      "coprec",
      arForm,
      mockAnalysisAR
    );
    expect(doc.titulo).toBe("Solicitud COPREC");
    expect(doc.contenido).toContain("Ley 26.993");
    expect(doc.contenido).toContain("COPREC");
    expect(doc.contenido).toContain("Personal");
    expect(doc.contenido).toContain("Art. 40 bis");
    expect(doc.filename).toContain("coprec");
  });

  it("generates Defensa del Consumidor document", () => {
    const doc = generateEscalationDocument(
      "defensa_consumidor",
      baseForm,
      mockAnalysisAR
    );
    expect(doc.titulo).toContain("Defensa del Consumidor");
    expect(doc.contenido).toContain("DENUNCIA");
  });
});

describe("getFilingInstructions", () => {
  it("returns steps for PROFECO queja", () => {
    const steps = getFilingInstructions("profeco_queja");
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0]).toContain("gob.mx/profeco");
  });

  it("returns steps for Concilianet", () => {
    const steps = getFilingInstructions("profeco_concilianet");
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0]).toContain("concilianet.profeco.gob.mx");
  });

  it("returns steps for COPREC", () => {
    const steps = getFilingInstructions("coprec");
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0]).toContain("consumoprotegido.gob.ar");
  });

  it("returns steps for Defensa del Consumidor", () => {
    const steps = getFilingInstructions("defensa_consumidor");
    expect(steps.length).toBeGreaterThan(3);
    expect(steps.some((s) => s.includes("CABA"))).toBe(true);
  });
});
