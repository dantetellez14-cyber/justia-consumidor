import { describe, it, expect } from "vitest";
import type { CompanyResponseView, CaseWithResponses, CaseRecord } from "@/lib/supabase";

describe("CompanyResponseView type", () => {
  const baseResponse: CompanyResponseView = {
    id: "resp-1",
    tipo_respuesta: "propuesta",
    mensaje: "Ofrecemos un descuento del 50%.",
    propuesta_monto: 2500,
    created_at: "2024-06-15T14:30:00Z",
  };

  it("supports aceptar response type", () => {
    const response: CompanyResponseView = {
      ...baseResponse,
      tipo_respuesta: "aceptar",
      propuesta_monto: null,
    };
    expect(response.tipo_respuesta).toBe("aceptar");
    expect(response.propuesta_monto).toBeNull();
  });

  it("supports rechazar response type", () => {
    const response: CompanyResponseView = {
      ...baseResponse,
      tipo_respuesta: "rechazar",
      propuesta_monto: null,
    };
    expect(response.tipo_respuesta).toBe("rechazar");
  });

  it("supports propuesta with monto", () => {
    expect(baseResponse.tipo_respuesta).toBe("propuesta");
    expect(baseResponse.propuesta_monto).toBe(2500);
  });

  it("supports solicitar_info response type", () => {
    const response: CompanyResponseView = {
      ...baseResponse,
      tipo_respuesta: "solicitar_info",
      propuesta_monto: null,
    };
    expect(response.tipo_respuesta).toBe("solicitar_info");
  });
});

describe("CaseWithResponses type", () => {
  const baseCase: CaseRecord = {
    id: "case-1",
    user_id: "user_123",
    relato: "Me cobraron de mas.",
    empresa: "Telecom",
    producto_servicio: "Internet",
    monto_reclamo: 5000,
    fecha_incidente: "2024-01-15",
    core_grievance: "Cobro indebido",
    probabilidad_exito: 0.75,
    analisis_legal: "Art. 10 bis",
    pais_detectado: "AR",
    status: "en_mediacion",
    complaint_generated: true,
    arbitration_completed: false,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  it("extends CaseRecord with empty responses array", () => {
    const caseWithResponses: CaseWithResponses = {
      ...baseCase,
      company_responses: [],
      consumer_responses: [],
    };
    expect(caseWithResponses.company_responses).toHaveLength(0);
    expect(caseWithResponses.empresa).toBe("Telecom");
  });

  it("extends CaseRecord with multiple responses", () => {
    const caseWithResponses: CaseWithResponses = {
      ...baseCase,
      company_responses: [
        {
          id: "resp-1",
          tipo_respuesta: "solicitar_info",
          mensaje: "Necesitamos tu numero de cuenta.",
          propuesta_monto: null,
          created_at: "2024-01-20T10:00:00Z",
        },
        {
          id: "resp-2",
          tipo_respuesta: "propuesta",
          mensaje: "Ofrecemos reembolso parcial.",
          propuesta_monto: 2500,
          created_at: "2024-01-25T10:00:00Z",
        },
      ],
      consumer_responses: [],
    };
    expect(caseWithResponses.company_responses).toHaveLength(2);
    expect(caseWithResponses.company_responses[0].tipo_respuesta).toBe("solicitar_info");
    expect(caseWithResponses.company_responses[1].propuesta_monto).toBe(2500);
  });

  it("identifies resolved case from aceptar response", () => {
    const caseWithResponses: CaseWithResponses = {
      ...baseCase,
      status: "resuelto",
      company_responses: [
        {
          id: "resp-1",
          tipo_respuesta: "aceptar",
          mensaje: "Aceptamos el reclamo.",
          propuesta_monto: null,
          created_at: "2024-01-20T10:00:00Z",
        },
      ],
      consumer_responses: [],
    };
    const latestResponse = caseWithResponses.company_responses[0];
    const isResolved = latestResponse?.tipo_respuesta === "aceptar";
    expect(isResolved).toBe(true);
    expect(caseWithResponses.status).toBe("resuelto");
  });
});
