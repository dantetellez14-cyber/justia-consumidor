/**
 * Escalation service for government consumer protection channels.
 *
 * Generates pre-filled data and formal documents for:
 * - PROFECO / Concilianet (Mexico)
 * - COPREC / Defensa del Consumidor (Argentina)
 *
 * Neither agency provides a public API, so JustIA generates
 * the complete submission package for the user to file manually.
 */

import type { CaseAnalysis } from "./types";

// ── Types ──

export type EscalationChannel =
  | "profeco_queja"       // PROFECO — Queja en línea
  | "profeco_concilianet" // PROFECO — Concilianet (online conciliation)
  | "coprec"              // COPREC — Conciliación previa (mandatory pre-judicial)
  | "defensa_consumidor"; // Defensa del Consumidor provincial (AR)

export interface EscalationChannelInfo {
  readonly id: EscalationChannel;
  readonly nombre: string;
  readonly descripcion: string;
  readonly url: string;
  readonly pais: "AR" | "MX";
  readonly tipo: "conciliacion" | "queja" | "denuncia";
  readonly obligatorio: boolean;
  readonly plazoEstimado: string;
  readonly requisitos: ReadonlyArray<string>;
  readonly documentos: ReadonlyArray<string>;
}

export interface EscalationFormData {
  /** Consumer info */
  readonly nombreCompleto: string;
  readonly documento: string; // DNI (AR) or CURP (MX)
  readonly domicilio: string;
  readonly email: string;
  readonly telefono: string;
  /** Provider info */
  readonly empresaNombre: string;
  readonly empresaDomicilio: string;
  readonly empresaRFC?: string; // MX only
  readonly empresaCUIT?: string; // AR only
  /** Claim details */
  readonly descripcionHechos: string;
  readonly montoReclamado: number;
  readonly fechaCompra: string;
  readonly productoServicio: string;
  readonly resolucionSolicitada: string;
  /** Prior complaint reference */
  readonly reclamoDirectoRealizado: boolean;
  readonly fechaReclamoDirecto?: string;
  readonly numeroReclamoDirecto?: string;
}

export interface EscalationDocument {
  readonly titulo: string;
  readonly contenido: string;
  readonly filename: string;
}

// ── Channel definitions ──

const CHANNELS: ReadonlyArray<EscalationChannelInfo> = [
  // ── Mexico ──
  {
    id: "profeco_queja",
    nombre: "PROFECO — Queja en Línea",
    descripcion:
      "Presenta una queja formal ante la Procuraduría Federal del Consumidor. " +
      "Un conciliador de PROFECO mediará entre tú y la empresa.",
    url: "https://www.gob.mx/profeco/tramites/queja-ante-profeco",
    pais: "MX",
    tipo: "queja",
    obligatorio: false,
    plazoEstimado: "15-30 días hábiles",
    requisitos: [
      "INE/IFE vigente",
      "CURP",
      "Comprobante de domicilio",
      "Comprobante de la transacción (ticket, factura, estado de cuenta)",
    ],
    documentos: [
      "Copia de identificación oficial (INE/IFE o pasaporte)",
      "Ticket de compra, factura o estado de cuenta bancario",
      "Contrato o garantía (si aplica)",
      "Capturas de pantalla de publicidad o comunicaciones",
      "Copia del reclamo previo enviado a la empresa (si aplica)",
    ],
  },
  {
    id: "profeco_concilianet",
    nombre: "Concilianet — Conciliación en Línea",
    descripcion:
      "Plataforma digital de PROFECO para resolver quejas 100% en línea. " +
      "Solo disponible para empresas registradas en el sistema.",
    url: "https://concilianet.profeco.gob.mx/",
    pais: "MX",
    tipo: "conciliacion",
    obligatorio: false,
    plazoEstimado: "10-20 días hábiles",
    requisitos: [
      "Registro en Concilianet con e.firma o CURP",
      "La empresa debe estar registrada en Concilianet",
      "Documentación digital del reclamo",
    ],
    documentos: [
      "Identificación oficial digitalizada",
      "Factura o comprobante de compra (PDF o imagen)",
      "Evidencia del problema (fotos, capturas, correos)",
      "Comunicaciones previas con la empresa",
    ],
  },
  // ── Argentina ──
  {
    id: "coprec",
    nombre: "COPREC — Conciliación Previa",
    descripcion:
      "Instancia de conciliación OBLIGATORIA antes de acceder a la vía judicial. " +
      "Un conciliador certificado mediará entre las partes en audiencia virtual.",
    url: "https://www.consumoprotegido.gob.ar/",
    pais: "AR",
    tipo: "conciliacion",
    obligatorio: true,
    plazoEstimado: "30 días corridos",
    requisitos: [
      "DNI argentino",
      "CUIL o CUIT",
      "Clave Fiscal (AFIP) o Mi Argentina",
      "Datos del proveedor (razón social, CUIT)",
    ],
    documentos: [
      "Copia del DNI (frente y dorso)",
      "Factura, ticket o comprobante de compra",
      "Contrato o condiciones generales (si aplica)",
      "Evidencia del reclamo (fotos, capturas, emails)",
      "Copia del reclamo previo enviado a la empresa",
      "Poder simple (si presenta un representante)",
    ],
  },
  {
    id: "defensa_consumidor",
    nombre: "Defensa del Consumidor — Denuncia",
    descripcion:
      "Presentación ante la Dirección de Defensa del Consumidor de tu provincia o CABA. " +
      "Pueden mediar e imponer multas a la empresa.",
    url: "https://www.argentina.gob.ar/produccion/defensadelconsumidor",
    pais: "AR",
    tipo: "denuncia",
    obligatorio: false,
    plazoEstimado: "30-60 días hábiles",
    requisitos: [
      "DNI argentino",
      "Domicilio en la jurisdicción correspondiente",
      "Documentación de la relación de consumo",
    ],
    documentos: [
      "Copia del DNI",
      "Factura o comprobante de la transacción",
      "Evidencia del incumplimiento",
      "Comunicaciones con la empresa",
      "Nota de reclamo previo (recomendado)",
    ],
  },
];

// ── Public functions ──

/**
 * Get available escalation channels for a country.
 */
export function getChannelsForCountry(
  pais: "AR" | "MX"
): ReadonlyArray<EscalationChannelInfo> {
  return CHANNELS.filter((ch) => ch.pais === pais);
}

/**
 * Get a specific channel by ID.
 */
export function getChannelById(
  id: EscalationChannel
): EscalationChannelInfo | undefined {
  return CHANNELS.find((ch) => ch.id === id);
}

/**
 * Get the recommended channel based on country and case context.
 */
export function getRecommendedChannel(
  pais: "AR" | "MX",
  analysis: CaseAnalysis
): EscalationChannel {
  if (pais === "AR") {
    // COPREC is mandatory before judicial action in Argentina
    return "coprec";
  }
  // In Mexico, prefer Concilianet for high-probability straightforward cases,
  // otherwise route to broader PROFECO queue.
  return analysis.probabilidad_exito >= 0.6
    ? "profeco_concilianet"
    : "profeco_queja";
}

/**
 * Pre-fill escalation form data from existing case analysis.
 */
export function prefillFromAnalysis(
  analysis: CaseAnalysis,
  nombre: string,
  email: string
): Partial<EscalationFormData> {
  return {
    nombreCompleto: nombre,
    email,
    empresaNombre: analysis.empresa,
    descripcionHechos: analysis.core_grievance,
    montoReclamado: analysis.monto_reclamo,
    fechaCompra: analysis.fecha_incidente,
    productoServicio: analysis.producto_servicio,
    reclamoDirectoRealizado: true,
  };
}

/**
 * Generate the formal escalation document for PROFECO.
 */
function generateProfecoDocument(
  form: EscalationFormData,
  analysis: CaseAnalysis
): EscalationDocument {
  const fecha = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contenido = `QUEJA ANTE LA PROCURADURÍA FEDERAL DEL CONSUMIDOR (PROFECO)

Fecha: ${fecha}
Folio interno JustIA: ${Date.now()}

═══════════════════════════════════════════════════════════
                     DATOS DEL CONSUMIDOR
═══════════════════════════════════════════════════════════

Nombre completo: ${form.nombreCompleto}
CURP: ${form.documento}
Domicilio: ${form.domicilio}
Correo electrónico: ${form.email}
Teléfono: ${form.telefono}

═══════════════════════════════════════════════════════════
                     DATOS DEL PROVEEDOR
═══════════════════════════════════════════════════════════

Razón social: ${form.empresaNombre}
${form.empresaRFC ? `RFC: ${form.empresaRFC}` : "RFC: [Por completar en portal PROFECO]"}
Domicilio: ${form.empresaDomicilio || "[Por completar]"}

═══════════════════════════════════════════════════════════
                    DATOS DE LA OPERACIÓN
═══════════════════════════════════════════════════════════

Producto/Servicio: ${form.productoServicio}
Fecha de compra: ${form.fechaCompra}
Monto reclamado: MXN $${form.montoReclamado.toLocaleString("es-MX")}
Medio de compra: [Completar: tienda física / internet / teléfono]

═══════════════════════════════════════════════════════════
                  DESCRIPCIÓN DE LOS HECHOS
═══════════════════════════════════════════════════════════

${form.descripcionHechos}

═══════════════════════════════════════════════════════════
                   RESOLUCIÓN SOLICITADA
═══════════════════════════════════════════════════════════

${form.resolucionSolicitada || "Devolución íntegra del monto pagado, más los daños y perjuicios que correspondan conforme a la Ley Federal de Protección al Consumidor."}

═══════════════════════════════════════════════════════════
                    FUNDAMENTO LEGAL
═══════════════════════════════════════════════════════════

Con fundamento en los artículos 7, 32, 52, 92 y 92 bis de la Ley Federal de Protección al Consumidor:

${analysis.analisis_legal}

═══════════════════════════════════════════════════════════
                 RECLAMO PREVIO AL PROVEEDOR
═══════════════════════════════════════════════════════════

${form.reclamoDirectoRealizado ? `Se realizó reclamo directo a ${form.empresaNombre}${form.fechaReclamoDirecto ? ` con fecha ${form.fechaReclamoDirecto}` : ""}${form.numeroReclamoDirecto ? `, número de referencia: ${form.numeroReclamoDirecto}` : ""}.
La empresa ${form.reclamoDirectoRealizado ? "no brindó una solución satisfactoria" : "no respondió al reclamo"}.` : "No se realizó reclamo previo directo al proveedor."}

═══════════════════════════════════════════════════════════
                    DOCUMENTOS ADJUNTOS
═══════════════════════════════════════════════════════════

[ ] Copia de identificación oficial (INE/IFE)
[ ] Comprobante de compra (ticket/factura)
[ ] Contrato o garantía
[ ] Capturas de pantalla (publicidad, comunicaciones)
[ ] Copia del reclamo previo enviado a la empresa

Bajo protesta de decir verdad, manifiesto que los hechos narrados son ciertos.

_____________________________
${form.nombreCompleto}
CURP: ${form.documento}`;

  return {
    titulo: "Queja PROFECO",
    contenido,
    filename: `queja_profeco_${form.empresaNombre.replace(/\s+/g, "_")}_${Date.now()}.txt`,
  };
}

/**
 * Generate the formal escalation document for COPREC.
 */
function generateCoprecDocument(
  form: EscalationFormData,
  analysis: CaseAnalysis
): EscalationDocument {
  const fecha = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contenido = `SOLICITUD DE CONCILIACIÓN ANTE COPREC
(Servicio de Conciliación Previa en las Relaciones de Consumo)
Ley 26.993

Fecha: ${fecha}
Folio interno JustIA: ${Date.now()}

═══════════════════════════════════════════════════════════
                     DATOS DEL CONSUMIDOR
═══════════════════════════════════════════════════════════

Nombre y apellido: ${form.nombreCompleto}
DNI: ${form.documento}
${form.empresaCUIT ? "" : "CUIL: [Por completar en portal COPREC]"}
Domicilio real: ${form.domicilio}
Correo electrónico: ${form.email}
Teléfono: ${form.telefono}

═══════════════════════════════════════════════════════════
                     DATOS DEL PROVEEDOR
═══════════════════════════════════════════════════════════

Razón social: ${form.empresaNombre}
${form.empresaCUIT ? `CUIT: ${form.empresaCUIT}` : "CUIT: [Por completar — consultar en https://www.cuitonline.com]"}
Domicilio legal: ${form.empresaDomicilio || "[Por completar]"}

═══════════════════════════════════════════════════════════
                       OBJETO DEL RECLAMO
═══════════════════════════════════════════════════════════

Producto/Servicio: ${form.productoServicio}
Fecha de adquisición: ${form.fechaCompra}
Monto reclamado: ARS $${form.montoReclamado.toLocaleString("es-AR")}

═══════════════════════════════════════════════════════════
                    RELATO DE LOS HECHOS
═══════════════════════════════════════════════════════════

${form.descripcionHechos}

═══════════════════════════════════════════════════════════
              DERECHO INVOCADO / NORMATIVA APLICABLE
═══════════════════════════════════════════════════════════

El presente reclamo se funda en la Ley 24.240 de Defensa del Consumidor y sus modificatorias, y en la Ley 26.993 que establece el Sistema de Resolución de Conflictos en las Relaciones de Consumo:

${analysis.analisis_legal}

Artículos aplicables de la Ley 24.240:
- Art. 4: Deber de información
- Art. 8 bis: Trato digno
- Art. 10 bis: Incumplimiento de la obligación
- Art. 17: Reparación no satisfactoria
- Art. 40 bis: Daño directo

═══════════════════════════════════════════════════════════
                   PRETENSIÓN DEL CONSUMIDOR
═══════════════════════════════════════════════════════════

${form.resolucionSolicitada || "Solicito la devolución íntegra del importe abonado, más los daños directos que correspondan conforme al Art. 40 bis de la Ley 24.240."}

═══════════════════════════════════════════════════════════
               RECLAMO PREVIO AL PROVEEDOR
═══════════════════════════════════════════════════════════

${form.reclamoDirectoRealizado ? `Se efectuó reclamo directo ante ${form.empresaNombre}${form.fechaReclamoDirecto ? ` con fecha ${form.fechaReclamoDirecto}` : ""}${form.numeroReclamoDirecto ? `, con número de referencia: ${form.numeroReclamoDirecto}` : ""}.
El proveedor no brindó una solución satisfactoria, razón por la cual se recurre a esta instancia de conciliación.` : "No se realizó reclamo previo. Se recurre directamente a COPREC conforme a lo establecido por la Ley 26.993."}

═══════════════════════════════════════════════════════════
                    DOCUMENTACIÓN ADJUNTA
═══════════════════════════════════════════════════════════

[ ] Copia de DNI (frente y dorso)
[ ] Factura, ticket o comprobante de compra
[ ] Contrato o condiciones generales de contratación
[ ] Evidencia del incumplimiento (fotos, capturas)
[ ] Copia del reclamo previo enviado al proveedor
[ ] Respuesta del proveedor (si la hubiere)

═══════════════════════════════════════════════════════════
                        DECLARACIÓN
═══════════════════════════════════════════════════════════

Declaro bajo juramento que los hechos expuestos son verídicos y que no he iniciado acción judicial por el mismo objeto.

_____________________________
${form.nombreCompleto}
DNI: ${form.documento}`;

  return {
    titulo: "Solicitud COPREC",
    contenido,
    filename: `solicitud_coprec_${form.empresaNombre.replace(/\s+/g, "_")}_${Date.now()}.txt`,
  };
}

/**
 * Generate the formal document for Defensa del Consumidor (AR provincial).
 */
function generateDefensaConsumidorDocument(
  form: EscalationFormData,
  analysis: CaseAnalysis
): EscalationDocument {
  const fecha = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contenido = `DENUNCIA ANTE DEFENSA DEL CONSUMIDOR

Fecha: ${fecha}
Folio interno JustIA: ${Date.now()}

═══════════════════════════════════════════════════════════
                     DATOS DEL DENUNCIANTE
═══════════════════════════════════════════════════════════

Nombre y apellido: ${form.nombreCompleto}
DNI: ${form.documento}
Domicilio: ${form.domicilio}
Correo electrónico: ${form.email}
Teléfono: ${form.telefono}

═══════════════════════════════════════════════════════════
                     DATOS DEL DENUNCIADO
═══════════════════════════════════════════════════════════

Razón social: ${form.empresaNombre}
${form.empresaCUIT ? `CUIT: ${form.empresaCUIT}` : "CUIT: [Por completar]"}
Domicilio: ${form.empresaDomicilio || "[Por completar]"}

═══════════════════════════════════════════════════════════
                        DENUNCIA
═══════════════════════════════════════════════════════════

Producto/Servicio: ${form.productoServicio}
Fecha de adquisición: ${form.fechaCompra}
Monto reclamado: ARS $${form.montoReclamado.toLocaleString("es-AR")}

HECHOS:
${form.descripcionHechos}

FUNDAMENTO LEGAL:
${analysis.analisis_legal}

PRETENSIÓN:
${form.resolucionSolicitada || "Solicito que se intime al proveedor a cumplir con las obligaciones previstas en la Ley 24.240 y se apliquen las sanciones correspondientes."}

═══════════════════════════════════════════════════════════
                   DOCUMENTACIÓN ADJUNTA
═══════════════════════════════════════════════════════════

[ ] Copia de DNI
[ ] Comprobante de la transacción
[ ] Evidencia del incumplimiento
[ ] Comunicaciones con la empresa
[ ] Nota de reclamo previo

_____________________________
${form.nombreCompleto}
DNI: ${form.documento}`;

  return {
    titulo: "Denuncia Defensa del Consumidor",
    contenido,
    filename: `denuncia_defensa_consumidor_${form.empresaNombre.replace(/\s+/g, "_")}_${Date.now()}.txt`,
  };
}

/**
 * Generate the escalation document for a given channel.
 */
export function generateEscalationDocument(
  channel: EscalationChannel,
  form: EscalationFormData,
  analysis: CaseAnalysis
): EscalationDocument {
  switch (channel) {
    case "profeco_queja":
    case "profeco_concilianet":
      return generateProfecoDocument(form, analysis);
    case "coprec":
      return generateCoprecDocument(form, analysis);
    case "defensa_consumidor":
      return generateDefensaConsumidorDocument(form, analysis);
  }
}

/**
 * Get step-by-step instructions for filing in a specific channel.
 */
export function getFilingInstructions(
  channel: EscalationChannel
): ReadonlyArray<string> {
  switch (channel) {
    case "profeco_queja":
      return [
        "Ingresa a gob.mx/profeco/tramites/queja-ante-profeco",
        "Crea una cuenta o inicia sesión con tu CURP",
        "Selecciona 'Nueva Queja'",
        "Llena el formulario con los datos del proveedor (usa el documento generado como referencia)",
        "Sube los documentos de soporte (factura, capturas, reclamo previo)",
        "Describe los hechos (puedes copiar el texto generado)",
        "Indica la resolución que solicitas",
        "Envía la queja y guarda tu número de folio",
        "PROFECO te notificará cuando se agende la audiencia de conciliación",
      ];
    case "profeco_concilianet":
      return [
        "Ingresa a concilianet.profeco.gob.mx",
        "Regístrate con tu e.firma (SAT) o CURP",
        "Verifica que la empresa esté registrada en Concilianet",
        "Si la empresa no está registrada, usa 'Queja en Línea' en su lugar",
        "Completa el formulario de queja con los datos generados",
        "Sube la documentación digital de soporte",
        "La plataforma notificará a la empresa electrónicamente",
        "Ambas partes negociarán por escrito a través de la plataforma",
        "Un conciliador de PROFECO mediará el proceso",
        "Si se llega a acuerdo, se firma convenio digital vinculante",
      ];
    case "coprec":
      return [
        "Ingresa a consumoprotegido.gob.ar",
        "Autentícate con tu Clave Fiscal (AFIP) o cuenta Mi Argentina",
        "Selecciona 'Iniciar reclamo'",
        "Completa los datos del proveedor (razón social, CUIT)",
        "Describe los hechos del reclamo (usa el documento generado)",
        "Indica el monto reclamado y la resolución que solicitas",
        "Sube la documentación de soporte",
        "Se asignará un conciliador y se agendará audiencia (generalmente virtual)",
        "Asistí a la audiencia de conciliación en la fecha indicada",
        "Si hay acuerdo, se homologa con fuerza de cosa juzgada",
        "Si no hay acuerdo, recibirás el acta de cierre para ir a la vía judicial",
      ];
    case "defensa_consumidor":
      return [
        "Ingresa al portal de Defensa del Consumidor de tu jurisdicción",
        "CABA: defensaconsumidor.buenosaires.gob.ar",
        "Provincia de Buenos Aires: www.gba.gob.ar/defensadelconsumidor",
        "Otras provincias: consulta el portal de tu gobierno provincial",
        "Completá el formulario de denuncia con los datos generados",
        "Adjuntá la documentación de soporte",
        "Defensa del Consumidor citará a la empresa a una audiencia",
        "Pueden mediar y/o imponer multas al proveedor",
      ];
  }
}
