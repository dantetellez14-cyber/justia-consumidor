export interface CaseAnalysis {
  empresa: string;
  producto_servicio: string;
  monto_reclamo: number;
  fecha_incidente: string;
  core_grievance: string;
  probabilidad_exito: number;
  analisis_legal: string;
  pais_detectado: "AR" | "MX";
}

export interface FinancialMetrics {
  valorReclamado: number;
  valorEsperado: number;
  costoAcuerdo: number;
  costoLegal: number;
  recomendacion: "SETTLE_NOW" | "DEFEND_SELECTIVELY";
}

export interface JurisprudenciaCase {
  expediente_id: string;
  hechos: string;
  ratio_decidendi: string;
  probabilidad_exito: number;
  duracion_dias: number;
  pais: "AR" | "MX";
}
