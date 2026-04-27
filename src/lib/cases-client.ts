import type { CaseAnalysis } from "@/lib/types";

export async function saveCase(relato: string, analysis: CaseAnalysis): Promise<string | null> {
  try {
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relato, ...analysis }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id as string;
    }
  } catch {
    // Non-blocking: continue even if save fails
  }
  return null;
}

export async function updateCase(caseId: string, updates: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch {
    // Non-blocking
  }
}
