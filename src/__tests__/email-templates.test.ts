import { describe, it, expect } from "vitest";
import {
  buildComplaintEmailHtml,
  buildUserConfirmationHtml,
} from "@/lib/email/templates";
import type { CaseAnalysis } from "@/lib/types";

const mockAnalysis: CaseAnalysis = {
  empresa: "Telecom Argentina",
  producto_servicio: "Internet fibra óptica",
  monto_reclamo: 150000,
  fecha_incidente: "2024-03-15",
  core_grievance: "Cobro indebido por 6 meses",
  probabilidad_exito: 0.82,
  analisis_legal: "Art. 10 bis Ley 24.240",
  pais_detectado: "AR",
};

describe("buildComplaintEmailHtml", () => {
  it("returns valid HTML string", () => {
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: "Juan Pérez",
      email: "juan@test.com",
      complaintText: "Solicito el reembolso de los cobros indebidos.",
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("includes consumer name", () => {
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: "María López",
      email: "maria@test.com",
      complaintText: "Reclamo formal",
    });
    expect(html).toContain("María López");
  });

  it("includes empresa name", () => {
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: "Test",
      email: "test@test.com",
      complaintText: "Reclamo",
    });
    expect(html).toContain("Telecom Argentina");
  });

  it("includes complaint text", () => {
    const complaintText = "Este es mi reclamo formal detallado.";
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: "Test",
      email: "test@test.com",
      complaintText,
    });
    expect(html).toContain("Este es mi reclamo formal detallado.");
  });

  it("shows ARS for Argentine cases", () => {
    const html = buildComplaintEmailHtml({
      analysis: { ...mockAnalysis, pais_detectado: "AR" },
      nombre: "Test",
      email: "test@test.com",
      complaintText: "Reclamo",
    });
    expect(html).toContain("ARS");
    expect(html).toContain("Argentina");
  });

  it("shows MXN for Mexican cases", () => {
    const html = buildComplaintEmailHtml({
      analysis: { ...mockAnalysis, pais_detectado: "MX" },
      nombre: "Test",
      email: "test@test.com",
      complaintText: "Reclamo",
    });
    expect(html).toContain("MXN");
    expect(html).toContain("Mexico");
  });

  it("escapes HTML in user input to prevent XSS", () => {
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: '<script>alert("xss")</script>',
      email: "test@test.com",
      complaintText: '<img src=x onerror="alert(1)">',
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('onerror="alert');
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes monto_reclamo amount", () => {
    const html = buildComplaintEmailHtml({
      analysis: mockAnalysis,
      nombre: "Test",
      email: "test@test.com",
      complaintText: "Reclamo",
    });
    expect(html).toContain("150");
  });
});

describe("buildUserConfirmationHtml", () => {
  it("returns valid HTML", () => {
    const html = buildUserConfirmationHtml("Juan", "Telecom");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("includes user name", () => {
    const html = buildUserConfirmationHtml("María López", "Telecom");
    expect(html).toContain("María López");
  });

  it("includes empresa name", () => {
    const html = buildUserConfirmationHtml("Juan", "MercadoLibre");
    expect(html).toContain("MercadoLibre");
  });

  it("mentions next steps", () => {
    const html = buildUserConfirmationHtml("Juan", "Telecom");
    expect(html).toContain("10 dias habiles");
  });

  it("escapes HTML in inputs", () => {
    const html = buildUserConfirmationHtml(
      '<script>alert("xss")</script>',
      "Test"
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
