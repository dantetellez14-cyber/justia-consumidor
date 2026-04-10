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

export interface JurisprudenciaCaseExtended extends JurisprudenciaCase {
  categoria: JurisprudenciaCategoria;
  tribunal: string;
  fecha_resolucion: string;        // ISO "YYYY-MM-DD"
  url_fuente: string;              // canonical URL of source page
  texto_crudo: string;             // raw text before Gemini normalization
  normalizado_por_ia: boolean;     // true once Gemini has filled the fields
}

export type JurisprudenciaCategoria =
  | "telefonica_movil"
  | "telefonica_fija"
  | "internet"
  | "television_paga"
  | "correo_y_paqueteria"
  | "banca"
  | "tarjetas_credito_debito"
  | "prestamos_y_creditos"
  | "seguros"
  | "fintech_y_billeteras_digitales"
  | "ecommerce"
  | "electrodomesticos"
  | "electronica_y_celulares"
  | "indumentaria_y_calzado"
  | "alimentos_y_bebidas"
  | "muebles_y_hogar"
  | "aerolineas"
  | "transporte_terrestre"
  | "automotriz_y_concesionarias"
  | "taller_mecanico"
  | "energia_electrica"
  | "gas"
  | "agua_y_saneamiento"
  | "medicina_prepaga_y_obra_social"
  | "farmacias_y_medicamentos"
  | "servicios_medicos"
  | "agencias_de_viaje"
  | "hoteles_y_alojamiento"
  | "streaming_y_entretenimiento"
  | "gimnasios_y_deporte"
  | "educacion"
  | "servicios_profesionales"
  | "inmobiliaria_y_alquiler"
  | "construccion_y_refacciones"
  | "publicidad_enganosa"
  | "otro";
