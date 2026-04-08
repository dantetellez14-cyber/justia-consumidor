import { describe, it, expect, vi } from "vitest";

// Mock dependencies before importing
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null }),
    },
  })),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      getUser: vi.fn().mockResolvedValue({
        emailAddresses: [{ emailAddress: "consumer@test.com" }],
        firstName: "Juan",
        lastName: "Perez",
      }),
    },
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { email_contacto: "empresa@test.com" },
              }),
            }),
          }),
          single: vi.fn().mockResolvedValue({
            data: { user_id: "user_123", pais_detectado: "AR" },
          }),
        }),
      }),
    }),
  },
}));

// Force re-import after mocks
const { buildNewComplaintAlertHtml, buildCompanyResponseAlertHtml } =
  await import("@/lib/email/templates");

describe("email notification templates", () => {
  describe("buildNewComplaintAlertHtml", () => {
    const baseData = {
      empresaNombre: "Telmex",
      consumidorNombre: "Juan Perez",
      productoServicio: "Internet fibra optica",
      montoReclamo: 5000,
      pais: "MX" as const,
      coreGrievance: "Cobro indebido por servicio no prestado",
      portalUrl: "https://justia-consumidor.vercel.app/empresa",
    };

    it("includes empresa name in header", () => {
      const html = buildNewComplaintAlertHtml(baseData);
      expect(html).toContain("Telmex");
      expect(html).toContain("JustIA Empresas");
    });

    it("includes complaint details", () => {
      const html = buildNewComplaintAlertHtml(baseData);
      expect(html).toContain("Juan Perez");
      expect(html).toContain("Internet fibra optica");
      expect(html).toContain("MXN");
      expect(html).toContain("5,000");
    });

    it("includes portal link", () => {
      const html = buildNewComplaintAlertHtml(baseData);
      expect(html).toContain("https://justia-consumidor.vercel.app/empresa");
      expect(html).toContain("Responder en el portal");
    });

    it("includes core grievance", () => {
      const html = buildNewComplaintAlertHtml(baseData);
      expect(html).toContain("Cobro indebido por servicio no prestado");
    });

    it("uses ARS for Argentina", () => {
      const arData = { ...baseData, pais: "AR" as const };
      const html = buildNewComplaintAlertHtml(arData);
      expect(html).toContain("ARS");
    });
  });

  describe("buildCompanyResponseAlertHtml", () => {
    const baseData = {
      consumidorNombre: "Maria Garcia",
      empresaNombre: "Personal",
      tipoRespuesta: "propuesta" as const,
      mensaje: "Ofrecemos un descuento del 50% en tu proxima factura",
      propuestaMonto: 2500,
      pais: "AR" as const,
      casosUrl: "https://justia-consumidor.vercel.app/mis-casos",
    };

    it("includes consumer greeting", () => {
      const html = buildCompanyResponseAlertHtml(baseData);
      expect(html).toContain("Maria Garcia");
      expect(html).toContain("Personal");
    });

    it("shows correct label for propuesta", () => {
      const html = buildCompanyResponseAlertHtml(baseData);
      expect(html).toContain("Propuesta de resolucion");
    });

    it("shows proposed amount", () => {
      const html = buildCompanyResponseAlertHtml(baseData);
      expect(html).toContain("ARS");
      expect(html).toContain("2,500");
    });

    it("shows acceptance message for aceptar", () => {
      const data = { ...baseData, tipoRespuesta: "aceptar" as const, propuestaMonto: null };
      const html = buildCompanyResponseAlertHtml(data);
      expect(html).toContain("Reclamo aceptado");
      expect(html).toContain("Tu reclamo fue resuelto");
    });

    it("shows escalation advice for rechazar", () => {
      const data = { ...baseData, tipoRespuesta: "rechazar" as const, propuestaMonto: null };
      const html = buildCompanyResponseAlertHtml(data);
      expect(html).toContain("Reclamo rechazado");
      expect(html).toContain("COPREC");
      expect(html).toContain("No te desanimes");
    });

    it("mentions PROFECO for Mexico rejections", () => {
      const data = { ...baseData, tipoRespuesta: "rechazar" as const, pais: "MX" as const, propuestaMonto: null };
      const html = buildCompanyResponseAlertHtml(data);
      expect(html).toContain("PROFECO");
    });

    it("includes link to cases page", () => {
      const html = buildCompanyResponseAlertHtml(baseData);
      expect(html).toContain("https://justia-consumidor.vercel.app/mis-casos");
      expect(html).toContain("Ver mi caso");
    });

    it("hides proposed amount when null", () => {
      const data = { ...baseData, propuestaMonto: null };
      const html = buildCompanyResponseAlertHtml(data);
      expect(html).not.toContain("Monto propuesto");
    });
  });
});
