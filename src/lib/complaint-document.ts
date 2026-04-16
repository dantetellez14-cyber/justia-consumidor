/**
 * Complaint document generation and local draft management.
 *
 * Shared by ComplaintGenerator (main flow) and the /mis-casos/editor page.
 */

import type { CaseAnalysis } from "@/lib/types";
import type { CaseRecord } from "@/lib/supabase";

// ── Document generation ───────────────────────────────────────────────────────

export interface ComplaintParams {
  readonly empresa: string;
  readonly productoServicio: string;
  readonly fechaIncidente: string;
  readonly montoReclamo: number;
  readonly coreGrievance: string;
  readonly analisisLegal: string;
  readonly pais: "AR" | "MX";
  readonly nombre?: string;
  readonly email?: string;
}

export function buildComplaintText(params: ComplaintParams): string {
  const fecha = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pais = params.pais === "MX" ? "México" : "Argentina";
  const ley =
    params.pais === "MX"
      ? "Ley Federal de Protección al Consumidor"
      : "Ley 24.240 de Defensa del Consumidor";
  const moneda = params.pais === "MX" ? "MXN" : "ARS";
  const organismo =
    params.pais === "MX"
      ? "PROFECO"
      : "COPREC/Defensa del Consumidor";

  const nombre = params.nombre ?? "[Nombre del consumidor]";
  const email = params.email ?? "[Email de contacto]";

  return `NOTA DE RECLAMO FORMAL

Fecha: ${fecha}
De: ${nombre}
Email: ${email}
Para: ${params.empresa}

ASUNTO: Reclamo formal por incumplimiento - ${params.productoServicio}

Estimados señores de ${params.empresa}:

Por medio de la presente, me dirijo a ustedes en mi carácter de consumidor/a para formular un reclamo formal en relación con el siguiente hecho:

PRODUCTO/SERVICIO: ${params.productoServicio}
FECHA DEL INCIDENTE: ${params.fechaIncidente}
MONTO RECLAMADO: ${moneda} $${params.montoReclamo.toLocaleString("es")}

DESCRIPCIÓN DEL RECLAMO:
${params.coreGrievance}

FUNDAMENTO LEGAL:
De acuerdo con la ${ley} vigente en ${pais}:
${params.analisisLegal}

SOLICITUD:
Solicito que en un plazo no mayor a 10 (diez) días hábiles a partir de la recepción de la presente, se proceda a:

1. Reconocer el incumplimiento señalado.
2. Ofrecer una solución satisfactoria que puede incluir: reparación, sustitución del producto o devolución íntegra del importe abonado.
3. Compensar los daños y perjuicios ocasionados conforme a derecho.

De no obtener una respuesta favorable en el plazo indicado, me reservo el derecho de iniciar las acciones legales correspondientes ante los organismos de defensa del consumidor (${organismo}) y/o la vía judicial.

Sin otro particular, saludo atentamente.

${nombre}
DNI/CURP: [Completar]
Domicilio: [Completar]
Teléfono: [Completar]`;
}

/** Build ComplaintParams from a CaseAnalysis (main flow). */
export function paramsFromAnalysis(
  analysis: CaseAnalysis,
  nombre?: string,
  email?: string
): ComplaintParams {
  return {
    empresa: analysis.empresa,
    productoServicio: analysis.producto_servicio,
    fechaIncidente: analysis.fecha_incidente,
    montoReclamo: analysis.monto_reclamo,
    coreGrievance: analysis.core_grievance,
    analisisLegal: analysis.analisis_legal,
    pais: analysis.pais_detectado,
    nombre,
    email,
  };
}

/** Build ComplaintParams from a CaseRecord (editor / seguimiento). */
export function paramsFromCaseRecord(record: CaseRecord): ComplaintParams | null {
  if (
    !record.empresa ||
    !record.producto_servicio ||
    !record.core_grievance ||
    !record.analisis_legal ||
    !record.pais_detectado ||
    record.monto_reclamo === null
  ) {
    return null;
  }

  return {
    empresa: record.empresa,
    productoServicio: record.producto_servicio,
    fechaIncidente: record.fecha_incidente ?? new Date().toISOString().slice(0, 10),
    montoReclamo: record.monto_reclamo,
    coreGrievance: record.core_grievance,
    analisisLegal: record.analisis_legal,
    pais: record.pais_detectado,
  };
}

// ── Local draft persistence (localStorage) ────────────────────────────────────

const DRAFT_KEY_PREFIX = "justia:complaint_draft:";

export function getDraftKey(caseId: string): string {
  return `${DRAFT_KEY_PREFIX}${caseId}`;
}

export function loadDraft(caseId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(getDraftKey(caseId));
  } catch {
    return null;
  }
}

export function saveDraft(caseId: string, text: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getDraftKey(caseId), text);
  } catch {
    // localStorage full or unavailable — ignore silently
  }
}

export function clearDraft(caseId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getDraftKey(caseId));
  } catch {
    // ignore
  }
}
