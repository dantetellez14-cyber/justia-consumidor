import type { CompanyDashboardStats, CompanyCaseView } from "@/lib/empresa";

export const mockEmpresaAccount = {
  id: "company-uuid-1",
  nombre_empresa: "Telecom",
  nombre_normalizado: "telecom",
  email_contacto: "atencion@telecom.com.ar",
  pais: "AR" as const,
  activa: true,
  created_at: "2026-01-01T00:00:00.000Z",
};

export const mockEmpresaStats: CompanyDashboardStats = {
  totalReclamos: 3,
  pendientes: 2,
  respondidos: 0,
  resueltos: 1,
  montoTotalReclamado: 35000,
  montoPromedioReclamado: 11667,
  tasaRespuesta: 33,
};

export const mockEmpresaComplaints: ReadonlyArray<CompanyCaseView> = [
  {
    id: "test-case-uuid-1",
    empresa: "Telecom",
    producto_servicio: "Internet de fibra óptica",
    monto_reclamo: 15000,
    fecha_incidente: "2026-01-15",
    core_grievance: "Cobro indebido por servicio no prestado durante 3 meses",
    probabilidad_exito: 0.75,
    pais_detectado: "AR",
    status: "enviado_empresa",
    created_at: "2026-01-20T10:00:00.000Z",
    updated_at: "2026-01-20T10:00:00.000Z",
    complaint_generated: true,
    arbitration_completed: false,
    relato: "Llevo 3 meses con cortes de internet diarios.",
    responses: [],
    consumer_replies: [],
  },
  {
    id: "test-case-uuid-2",
    empresa: "Telecom",
    producto_servicio: "Telefonía fija",
    monto_reclamo: 8000,
    fecha_incidente: "2026-02-01",
    core_grievance: "Cargo por servicio dado de baja sin notificación",
    probabilidad_exito: 0.65,
    pais_detectado: "AR",
    status: "enviado_empresa",
    created_at: "2026-02-05T14:30:00.000Z",
    updated_at: "2026-02-05T14:30:00.000Z",
    complaint_generated: true,
    arbitration_completed: false,
    relato: "Me cobraron un servicio que di de baja hace 2 meses.",
    responses: [],
    consumer_replies: [],
  },
];

// Full registered empresa API response
export const mockEmpresaRegisteredResponse = {
  registered: true,
  account: mockEmpresaAccount,
  role: "admin" as const,
  stats: mockEmpresaStats,
  complaints: mockEmpresaComplaints,
};

// Unregistered empresa — has complaints waiting
export const mockEmpresaUnregisteredWithComplaints = {
  registered: false,
  suggestion: {
    type: "has_complaints" as const,
    empresaName: "Telecom",
    complaintCount: 3,
    email: "atencion@telecom.com.ar",
  },
};
