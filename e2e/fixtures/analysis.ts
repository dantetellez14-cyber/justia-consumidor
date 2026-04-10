import type { CaseAnalysis } from "@/lib/types";

export const mockAnalysis: CaseAnalysis = {
  empresa: "Telecom",
  producto_servicio: "Internet de fibra óptica",
  monto_reclamo: 15000,
  fecha_incidente: "2026-01-15",
  core_grievance: "Cobro indebido por servicio no prestado durante 3 meses",
  probabilidad_exito: 0.75,
  analisis_legal:
    "Conforme al art. 10 bis de la Ley 24.240, el consumidor tiene derecho a la devolución íntegra del monto facturado por servicios no prestados. La probabilidad de éxito es alta dado el historial de cobros indebidos documentados.",
  pais_detectado: "AR",
};
