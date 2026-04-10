import type { JurisprudenciaCaseExtended } from "../../src/lib/types";

export function buildVectorId(expediente_id: string): string {
  return expediente_id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 512);
}

export function getNewCasesForPinecone(
  allCases: JurisprudenciaCaseExtended[],
  existingPineconeIds: Set<string>
): JurisprudenciaCaseExtended[] {
  return allCases.filter((c) => {
    const vectorId = buildVectorId(c.expediente_id);
    if (existingPineconeIds.has(vectorId) || existingPineconeIds.has(c.expediente_id)) return false;
    if (c.probabilidad_exito === 0 || !c.normalizado_por_ia) return false;
    return true;
  });
}
