import api from "./api";

export interface ChecklistResponse {
  checked_ids: string[];
}

/** Fetch the current user's saved checklist progress from the backend. */
export async function fetchChecklist(): Promise<ChecklistResponse> {
  const { data } = await api.get<ChecklistResponse>("/api/auth/me/checklist");
  return data;
}

/** Persist the current user's checklist progress to the backend. */
export async function saveChecklist(checkedIds: string[]): Promise<void> {
  await api.patch("/api/auth/me/checklist", { checked_ids: checkedIds });
}
