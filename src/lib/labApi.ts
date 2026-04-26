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

export type PlanData = {
  executive_summary: string;
  protocol_steps: ProtocolStep[];
  materials_list: Material[];
  total_budget_usd: number;
  timeline_weeks: number;
  validation_approach: string;
};

export type PlanResponse = {
  status: "success";
  data: PlanData;
};

export type SaveFeedbackPayload = {
  original_hypothesis: string;
  domain: string;
  corrected_plan: PlanData;
  scientist_notes: string;
};

export type SaveFeedbackResponse = {
  status: "success" | "error";
  message: string;
};
//mehu got
export type HealthResponse = {
  status: string;
  service: string;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchLiteratureQc(hypothesis: string, domain: string): Promise<QcResponse> {
  return postJson<QcResponse>("/api/literature-qc", { hypothesis, domain });
}

export function fetchExperimentPlan(hypothesis: string, domain: string): Promise<PlanResponse> {
  return postJson<PlanResponse>("/api/generate-plan", { hypothesis, domain });
}

export function saveFeedback(payload: SaveFeedbackPayload): Promise<SaveFeedbackResponse> {
  return postJson<SaveFeedbackResponse>("/api/save-feedback", payload);
}

export async function pingBackend(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/`, { headers: JSON_HEADERS });
  if (!res.ok) throw new Error(`Healthcheck failed (${res.status})`);
  return (await res.json()) as HealthResponse;
}
