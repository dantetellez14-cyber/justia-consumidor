import { http, HttpResponse } from "msw";
import { mockAnalysis } from "../fixtures/analysis";
import { mockCases } from "../fixtures/cases";

export const handlers = [
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
];
