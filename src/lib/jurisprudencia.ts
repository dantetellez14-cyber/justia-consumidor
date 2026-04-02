import { JurisprudenciaCase } from "./types";

export const jurisprudencia: ReadonlyArray<JurisprudenciaCase> = [
  // Argentina (5 cases)
  {
    expediente_id: "CNACom Sala A - 2023/04521",
    hechos:
      "Consumidor adquirió electrodoméstico con defecto de fábrica. La empresa se negó a reparar dentro del plazo de garantía legal.",
    ratio_decidendi:
      "Se aplicó el art. 17 de la Ley 24.240: el consumidor tiene derecho a la reparación, sustitución o devolución del precio pagado.",
    probabilidad_exito: 0.87,
    duracion_dias: 120,
    pais: "AR",
  },
  {
    expediente_id: "CNCiv Sala F - 2022/11234",
    hechos:
      "Compra online de producto que nunca fue entregado. Empresa no reembolsó ni respondió reclamos.",
    ratio_decidendi:
      "Incumplimiento contractual agravado por conducta dilatoria. Daño moral procedente conforme art. 40 bis Ley 24.240.",
    probabilidad_exito: 0.92,
    duracion_dias: 90,
    pais: "AR",
  },
  {
    expediente_id: "JNac1raInstCom N45 - 2023/07891",
    hechos:
      "Servicio de telecomunicaciones facturó importes superiores al plan contratado durante 6 meses.",
    ratio_decidendi:
      "Violación del deber de información (art. 4, Ley 24.240) y trato digno (art. 8 bis). Procedió restitución y daño punitivo.",
    probabilidad_exito: 0.78,
    duracion_dias: 180,
    pais: "AR",
  },
  {
    expediente_id: "CNACom Sala D - 2024/00234",
    hechos:
      "Vehículo nuevo con fallas mecánicas reiteradas. Concesionaria realizó múltiples reparaciones sin éxito.",
    ratio_decidendi:
      "Aplicación del art. 17 Ley 24.240: tras reparación insatisfactoria, procede sustitución del bien o devolución del importe.",
    probabilidad_exito: 0.83,
    duracion_dias: 240,
    pais: "AR",
  },
  {
    expediente_id: "CNCiv Sala K - 2023/15678",
    hechos:
      "Entidad bancaria cobró comisiones no informadas en cuenta de ahorro del consumidor.",
    ratio_decidendi:
      "Violación del deber de información y buena fe contractual. Restitución de comisiones más intereses conforme arts. 4 y 37 Ley 24.240.",
    probabilidad_exito: 0.75,
    duracion_dias: 150,
    pais: "AR",
  },
  // Mexico (5 cases)
  {
    expediente_id: "PROFECO/CDMX/2023/C-4521",
    hechos:
      "Compra de vehículo con vicios ocultos. Agencia se negó a hacer válida la garantía.",
    ratio_decidendi:
      "Conforme art. 92 LFPC, el consumidor tiene derecho a la bonificación o compensación no menor al 20% del precio pagado.",
    probabilidad_exito: 0.85,
    duracion_dias: 60,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/JAL/2022/C-8901",
    hechos:
      "Aerolínea canceló vuelo sin previo aviso ni ofrecimiento de alternativas al pasajero.",
    ratio_decidendi:
      "Violación del art. 52 de la Ley de Aviación Civil y arts. 7 y 92 bis LFPC. Procedió indemnización por daños.",
    probabilidad_exito: 0.9,
    duracion_dias: 45,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/NL/2023/C-2345",
    hechos:
      "Empresa de telecomunicaciones incrementó tarifa mensual sin notificación previa al usuario.",
    ratio_decidendi:
      "Incumplimiento del art. 7 LFPC sobre información clara y veraz. Se ordenó restitución de diferencias cobradas.",
    probabilidad_exito: 0.8,
    duracion_dias: 75,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/CDMX/2024/C-0567",
    hechos:
      "Plataforma de e-commerce entregó producto diferente al anunciado sin ofrecer cambio ni devolución.",
    ratio_decidendi:
      "Publicidad engañosa conforme art. 32 LFPC. Se ordenó devolución del precio y bonificación del 20%.",
    probabilidad_exito: 0.88,
    duracion_dias: 30,
    pais: "MX",
  },
  {
    expediente_id: "PROFECO/QRO/2023/C-6789",
    hechos:
      "Gimnasio retuvo pagos anticipados tras cierre temporal y se negó a reembolsar al consumidor.",
    ratio_decidendi:
      "Aplicación del art. 92 LFPC: ante incumplimiento del proveedor, procede devolución íntegra más compensación.",
    probabilidad_exito: 0.82,
    duracion_dias: 50,
    pais: "MX",
  },
];

export function filterByCountry(
  pais: "AR" | "MX"
): ReadonlyArray<JurisprudenciaCase> {
  return jurisprudencia.filter((c) => c.pais === pais);
}
