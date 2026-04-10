import { describe, it, expect } from "vitest";
import {
  buildNormalizePrompt,
  parseNormalizeResponse,
} from "../../../scripts/lib/normalize-prompt";

describe("buildNormalizePrompt", () => {
  it("includes the texto_crudo in the prompt", () => {
    const prompt = buildNormalizePrompt("consumidor reclamó garantía");
    expect(prompt).toContain("consumidor reclamó garantía");
  });

  it("instructs Gemini to return JSON only", () => {
    const prompt = buildNormalizePrompt("texto");
    expect(prompt).toContain("JSON válido");
  });

  it("lists all required JSON keys", () => {
    const prompt = buildNormalizePrompt("texto");
    expect(prompt).toContain("hechos");
    expect(prompt).toContain("ratio_decidendi");
    expect(prompt).toContain("categoria");
    expect(prompt).toContain("probabilidad_exito");
    expect(prompt).toContain("duracion_dias");
  });
});

describe("parseNormalizeResponse", () => {
  it("parses a clean JSON response", () => {
    const raw = JSON.stringify({
      hechos: "Consumidor no recibió producto",
      ratio_decidendi: "Art. 40 bis Ley 24.240 daño moral",
      categoria: "ecommerce",
      probabilidad_exito: 0.85,
      duracion_dias: 60,
    });
    const result = parseNormalizeResponse(raw);
    expect(result).not.toBeNull();
    expect(result!.hechos).toBe("Consumidor no recibió producto");
    expect(result!.probabilidad_exito).toBe(0.85);
    expect(result!.duracion_dias).toBe(60);
    expect(result!.categoria).toBe("ecommerce");
  });

  it("parses JSON wrapped in markdown code block", () => {
    const raw = "```json\n{\"hechos\":\"test\",\"ratio_decidendi\":\"art 17\",\"categoria\":\"banca\",\"probabilidad_exito\":0.7,\"duracion_dias\":90}\n```";
    const result = parseNormalizeResponse(raw);
    expect(result).not.toBeNull();
    expect(result!.hechos).toBe("test");
  });

  it("returns null on invalid JSON", () => {
    const result = parseNormalizeResponse("not json at all");
    expect(result).toBeNull();
  });

  it("returns null when probabilidad_exito is missing", () => {
    const raw = JSON.stringify({
      hechos: "test",
      ratio_decidendi: "test",
      categoria: "otro",
      duracion_dias: 30,
    });
    const result = parseNormalizeResponse(raw);
    expect(result).toBeNull();
  });

  it("returns null when probabilidad_exito is out of range", () => {
    const raw = JSON.stringify({
      hechos: "test",
      ratio_decidendi: "test",
      categoria: "otro",
      probabilidad_exito: 1.5,
      duracion_dias: 30,
    });
    const result = parseNormalizeResponse(raw);
    expect(result).toBeNull();
  });

  it("coerces string probabilidad_exito to number", () => {
    const raw = JSON.stringify({
      hechos: "test",
      ratio_decidendi: "test",
      categoria: "banca",
      probabilidad_exito: "0.8",
      duracion_dias: 45,
    });
    const result = parseNormalizeResponse(raw);
    expect(result).not.toBeNull();
    expect(result!.probabilidad_exito).toBe(0.8);
  });
});
