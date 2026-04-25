// Real API client for Fulcrum LabGen.
// Points at the FastAPI backend (configurable via VITE_API_URL).

export type NoveltySignal = "not found" | "similar work exists" | "exact match found";

export type QcResponse = {
  status: "success";
  data: {
    novelty_signal: NoveltySignal;
    references: { title: string; url: string; source: string }[];
  };
};

export type ProtocolStep = {
  step_number: number;
  title: string;
  description: string;
  duration_hours: number;
};

export type Material = {
  item_name: string;
  supplier: string;
  catalog_number: string;
  estimated_cost_usd: number;
};

export type PlanResponse = {
  status: "success";
  data: {
    executive_summary: string;
    protocol_steps: ProtocolStep[];
    materials_list: Material[];
    total_budget_usd: number;
    timeline_weeks: number;
    validation_approach: string;
  };
};

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchLiteratureQc(hypothesis: string): Promise<QcResponse> {
  return postJson<QcResponse>("/api/literature-qc", { hypothesis });
}

export function fetchExperimentPlan(hypothesis: string): Promise<PlanResponse> {
  return postJson<PlanResponse>("/api/generate-plan", { hypothesis });
}

// Backwards-compatible helper. Pass the hypothesis as the second arg.
export async function fetchLabData(endpoint: "qc", hypothesis: string): Promise<QcResponse>;
export async function fetchLabData(endpoint: "plan", hypothesis: string): Promise<PlanResponse>;
export async function fetchLabData(
  endpoint: "qc" | "plan",
  hypothesis: string
): Promise<QcResponse | PlanResponse> {
  return endpoint === "qc"
    ? fetchLiteratureQc(hypothesis)
    : fetchExperimentPlan(hypothesis);
}
