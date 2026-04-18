import { http, HttpResponse } from "msw";
import { mockAnalysis } from "../fixtures/analysis";
import { mockCases } from "../fixtures/cases";
import {
  mockEmpresaRegisteredResponse,
  mockEmpresaUnregisteredWithComplaints,
  mockEmpresaAccount,
  mockEmpresaStats,
  mockEmpresaComplaints,
} from "../fixtures/empresa";

export const handlers = [
  // ── Consumer flow ─────────────────────────────────────────────────────────

  // Mock Gemini analysis
  http.post("/api/analyze", () => {
    return HttpResponse.json(mockAnalysis);
  }),

  // Mock case creation
  http.post("/api/cases", () => {
    return HttpResponse.json({
      ...mockCases[0],
      id: "test-case-uuid-new",
      status: "consulta_recibida",
    });
  }),

  // Mock cases list
  http.get("/api/cases", () => {
    return HttpResponse.json(mockCases);
  }),

  // Mock send-complaint
  http.post("/api/send-complaint", () => {
    return HttpResponse.json({
      success: true,
      message: "Reclamo enviado exitosamente.",
    });
  }),

  // Mock feedback
  http.post("/api/feedback", () => {
    return HttpResponse.json({ success: true });
  }),

  // ── Empresa portal ────────────────────────────────────────────────────────

  // GET /api/empresa — registered company dashboard
  http.get("/api/empresa", () => {
    return HttpResponse.json(mockEmpresaRegisteredResponse);
  }),

  // POST /api/empresa — company registration
  http.post("/api/empresa", () => {
    return HttpResponse.json({
      registered: true,
      account: mockEmpresaAccount,
      role: "admin",
      stats: mockEmpresaStats,
      complaints: mockEmpresaComplaints,
    });
  }),

  // POST /api/empresa/respond — send response to a complaint
  http.post("/api/empresa/respond", () => {
    return HttpResponse.json({ success: true });
  }),

  // GET /api/notifications — unread count (used by NotificationBell)
  http.get("/api/notifications", () => {
    return HttpResponse.json({ notifications: [], unread: 0 });
  }),
];

// Variant handlers for specific test scenarios
export const unregisteredEmpresaHandler = http.get("/api/empresa", () => {
  return HttpResponse.json(mockEmpresaUnregisteredWithComplaints);
});
